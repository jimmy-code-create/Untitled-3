/**
 * Live metal-rate engine (server only).
 *
 * Flow: spot adapter → INR/gram conversion → India adjustment → 3% sanity guard
 * → MetalRate (published shop rate) + RateSnapshot (history) → public API.
 * Fallback chain: live feed → last published snapshot (< 30 min) → manual rate.
 */

import { getPrisma, getRateRows, getRates, getSettings, saveRates, updateSettings } from "./repo";
import { readDemo, writeDemo, type DemoRateAudit, type DemoRateSnapshot } from "./demo-db";
import type { RateConfig } from "./settings";
import type { RateMap } from "./pricing";

export type RateAudit = DemoRateAudit;

export const TROY_OUNCE_GRAMS = 31.1035;
export const SANITY_GUARD = 0.03; // max 3% movement before owner approval
export const LIVE_WINDOW_MS = 30 * 60 * 1000;

export const PURITIES = [
  { metal: "GOLD" as const, purity: "24K", factor: 1 },
  { metal: "GOLD" as const, purity: "22K", factor: 0.916 },
  { metal: "GOLD" as const, purity: "18K", factor: 0.75 },
  { metal: "SILVER" as const, purity: "SILVER_999", factor: 1 },
  { metal: "SILVER" as const, purity: "SILVER_925", factor: 0.925 },
] as const;

export type RateStatus = "live" | "manual" | "stale" | "pending";

export interface SpotRates {
  /** USD per troy ounce. */
  xauUsdOz: number;
  xagUsdOz: number;
  usdInr: number;
  fetchedAt: string;
  source: string;
}

export interface RateChange {
  delta: number;
  pct: number;
}

export interface PublicRates {
  rates: RateMap;
  status: RateStatus;
  source: string;
  snapshotId: string;
  /** When the shop rate was last published. */
  updatedAt: string;
  /** When the spot feed was last fetched, if any. */
  fetchedAt: string | null;
  stale: boolean;
  staleLabel: string | null;
  changes: Record<string, RateChange | null>;
  pending: string[];
  liveConfigured: boolean;
}

export interface RateSnapshotRow {
  id: string;
  metal: "GOLD" | "SILVER";
  purity: string;
  ratePerGram: number;
  source: string;
  fetchedAt: string;
  status: "PUBLISHED" | "PENDING" | "MANUAL" | "STALE";
  note?: string;
}

export interface RateCard {
  metal: "GOLD" | "SILVER";
  purity: string;
  label: string;
  shopRate: number;
  feedRate: number | null;
  difference: number | null;
  updatedAt: string;
  pending: number | null;
  staleMinutes: number | null;
  useLiveFeed: boolean;
  history: RateSnapshotRow[];
}

/* ───────────────────────── spot provider adapter ───────────────────────── */

/**
 * Metals-API adapter. Docs: latest?access_key=…&base=USD&symbols=XAU,XAG,INR
 * The API returns units per USD, so USD/XAU = 1 / rates.XAU.
 * Swap this function for another provider without touching the rest.
 */
export async function fetchSpotRates(): Promise<SpotRates | null> {
  const key = process.env.METAL_API_KEY;
  if (!key) return null;

  const endpoint = process.env.METAL_API_URL || "https://metals-api.com/api/latest";
  const url = new URL(endpoint);
  url.searchParams.set("access_key", key);
  url.searchParams.set("base", "USD");
  url.searchParams.set("symbols", "XAU,XAG,INR");

  const res = await fetch(url.toString(), {
    cache: "no-store",
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(12_000),
  });
  if (!res.ok) throw new Error(`Spot feed responded ${res.status}`);
  const json: any = await res.json();
  if (json?.success === false) throw new Error(json?.error?.info ?? "Spot feed rejected the request");

  const rates = json?.rates ?? {};
  const xau = Number(rates.XAU);
  const xag = Number(rates.XAG);
  const usdInr = Number(rates.INR);
  if (!(xau > 0) || !(xag > 0) || !(usdInr > 0)) throw new Error("Spot feed returned invalid metals data");

  return {
    xauUsdOz: 1 / xau,
    xagUsdOz: 1 / xag,
    usdInr,
    fetchedAt: new Date().toISOString(),
    source: "metals-api",
  };
}

/**
 * FREE keyless adapter — no signup, no quota, works with the 5-minute cron.
 * Metals: Yahoo Finance continuous futures (USD per troy ounce).
 * FX:     Yahoo USDINR=X with Frankfurter (ECB data) as fallback.
 */
async function fetchYahooQuote(symbol: string): Promise<number> {
  const res = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1d`,
    {
      cache: "no-store",
      headers: { "user-agent": "Mozilla/5.0", accept: "application/json" },
      signal: AbortSignal.timeout(12_000),
    },
  );
  if (!res.ok) throw new Error(`Free feed ${symbol} responded ${res.status}`);
  const json: any = await res.json();
  const price = Number(json?.chart?.result?.[0]?.meta?.regularMarketPrice);
  if (!(price > 0)) throw new Error(`Free feed ${symbol} returned no price`);
  return price;
}

async function fetchFrankfurterUsdInr(): Promise<number> {
  const res = await fetch("https://api.frankfurter.dev/v1/latest?base=USD&symbols=INR", {
    cache: "no-store",
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(12_000),
  });
  if (!res.ok) throw new Error(`FX fallback responded ${res.status}`);
  const json: any = await res.json();
  const rate = Number(json?.rates?.INR);
  if (!(rate > 0)) throw new Error("FX fallback returned no INR rate");
  return rate;
}

export async function fetchFreeSpotRates(): Promise<SpotRates | null> {
  try {
    const [xauUsdOz, xagUsdOz] = await Promise.all([fetchYahooQuote("GC=F"), fetchYahooQuote("SI=F")]);
    let usdInr: number;
    try {
      usdInr = await fetchYahooQuote("USDINR=X");
    } catch {
      usdInr = await fetchFrankfurterUsdInr();
    }
    return { xauUsdOz, xagUsdOz, usdInr, fetchedAt: new Date().toISOString(), source: "free-market" };
  } catch {
    return null;
  }
}

/* ───────────────────────── conversion + guard ───────────────────────── */
export function convertSpotToRates(spot: SpotRates, config: RateConfig): Record<string, number> {
  const duty = 1 + config.importDutyPct / 100;
  const premium = config.premiumPerGram;
  const goldPure = (spot.xauUsdOz * spot.usdInr * duty) / TROY_OUNCE_GRAMS + premium;
  const silverPure = (spot.xagUsdOz * spot.usdInr * duty) / TROY_OUNCE_GRAMS + premium;

  return {
    "24K": Math.round(goldPure),
    "22K": Math.round(goldPure * 0.916),
    "18K": Math.round(goldPure * 0.75),
    SILVER_999: Math.round(silverPure),
    SILVER_925: Math.round(silverPure * 0.925),
  };
}

export function exceedsGuard(previous: number, next: number, threshold = SANITY_GUARD) {
  if (!(previous > 0)) return false;
  return Math.abs(next - previous) / previous > threshold;
}

/** Swappable provider contract. Add a new adapter here without touching pricing. */
export interface RateProvider {
  name: string;
  fetchSpotRates: () => Promise<SpotRates | null>;
}

export const metalsApiProvider: RateProvider = {
  name: "metals-api",
  fetchSpotRates,
};

/** Keyless market feed — free, unlimited for a 5‑minute cron. */
export const freeMarketProvider: RateProvider = {
  name: "free-market",
  fetchSpotRates: fetchFreeSpotRates,
};

export const manualProvider: RateProvider = {
  name: "manual",
  fetchSpotRates: async () => null,
};

/* ───────────────────────── snapshot persistence ───────────────────────── */

function mapSnapshot(row: any): RateSnapshotRow {
  return {
    id: row.id,
    metal: row.metal,
    purity: row.purity,
    ratePerGram: row.ratePerGram,
    source: row.source ?? "MANUAL",
    fetchedAt: new Date(row.fetchedAt ?? row.createdAt ?? Date.now()).toISOString(),
    status: row.status ?? "PUBLISHED",
    note: row.note ?? undefined,
  };
}

export async function listSnapshots(limit = 200): Promise<RateSnapshotRow[]> {
  const prisma = await getPrisma();
  if (prisma) {
    try {
      const rows = await prisma.rateSnapshot.findMany({
        orderBy: { fetchedAt: "desc" },
        take: limit,
      });
      if (rows.length) return rows.map(mapSnapshot);
    } catch {
      /* fall through */
    }
  }
  return (readDemo().rateSnapshots ?? [])
    .slice()
    .sort((a, b) => b.fetchedAt.localeCompare(a.fetchedAt))
    .slice(0, limit)
    .map(mapSnapshot);
}

async function addSnapshot(row: Omit<DemoRateSnapshot, "id">) {
  const prisma = await getPrisma();
  if (prisma) {
    try {
      await prisma.rateSnapshot.create({
        data: {
          metal: row.metal,
          purity: row.purity,
          ratePerGram: row.ratePerGram,
          source: row.source,
          fetchedAt: new Date(row.fetchedAt),
          status: row.status,
          note: row.note,
        },
      });
      return;
    } catch {
      /* fall through */
    }
  }
  const demo = readDemo();
  demo.rateSnapshots = [
    { ...row, id: `snap-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` },
    ...(demo.rateSnapshots ?? []),
  ].slice(0, 500);
  writeDemo(demo);
}

async function addAudit(row: Omit<DemoRateAudit, "id">) {
  const prisma = await getPrisma();
  if (prisma) {
    try {
      await prisma.rateAudit.create({
        data: {
          purity: row.purity,
          oldRate: row.oldRate,
          newRate: row.newRate,
          actor: row.actor,
          action: row.action,
        },
      });
      return;
    } catch {
      /* fall through */
    }
  }
  const demo = readDemo();
  demo.rateAudit = [
    { ...row, id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` },
    ...(demo.rateAudit ?? []),
  ].slice(0, 300);
  writeDemo(demo);
}

export async function listAudit(limit = 100): Promise<DemoRateAudit[]> {
  const prisma = await getPrisma();
  if (prisma) {
    try {
      const rows = await prisma.rateAudit.findMany({ orderBy: { at: "desc" }, take: limit });
      if (rows.length) {
        return rows.map((r: any) => ({
          id: r.id,
          purity: r.purity,
          oldRate: r.oldRate,
          newRate: r.newRate,
          actor: r.actor,
          action: r.action,
          at: new Date(r.at).toISOString(),
        }));
      }
    } catch {
      /* fall through */
    }
  }
  return readDemo().rateAudit ?? [];
}

/* ───────────────────────── public state / fallback chain ───────────────────────── */

function istLabel(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(value));
}

/** Fast in-process cache (60s) to avoid hammering the DB on every render. */
let cache: { at: number; value: PublicRates } | null = null;

export async function getPublicRates(force = false): Promise<PublicRates> {
  if (!force && cache && Date.now() - cache.at < 60_000) return cache.value;

  const [rates, settings, snapshots, rows] = await Promise.all([
    getRates(),
    getSettings(),
    listSnapshots(120),
    getRateRows(),
  ]);
  const manualUpdatedAt = rows
    .map((r) => r.updatedAt)
    .filter(Boolean)
    .sort()
    .at(-1) ?? new Date().toISOString();
  const provider = settings.rateConfig.provider;
  // "free" needs no key at all; "metals-api" needs METAL_API_KEY.
  const liveConfigured = provider === "free" || (provider === "metals-api" && Boolean(process.env.METAL_API_KEY));
  const wantsLive = settings.rateConfig.useLiveFeed.gold || settings.rateConfig.useLiveFeed.silver;
  const feedSnapshots = snapshots.filter((s) => s.source !== "MANUAL");
  const latestFeed = feedSnapshots[0] ?? null;
  const pending = snapshots.filter((s) => s.status === "PENDING").map((s) => s.purity);

  const ageMs = latestFeed ? Date.now() - new Date(latestFeed.fetchedAt).getTime() : Infinity;
  let status: RateStatus = "manual";
  if (wantsLive && liveConfigured) {
    status = ageMs <= LIVE_WINDOW_MS ? "live" : "stale";
  }
  if (pending.length) status = "pending";

  const changes: Record<string, RateChange | null> = {};
  const istDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
  const startOfToday = new Date(`${istDate}T00:00:00+05:30`).getTime();

  for (const p of PURITIES) {
    const previous = snapshots
      .filter(
        (s) =>
          s.purity === p.purity &&
          (s.status === "PUBLISHED" || s.status === "MANUAL") &&
          new Date(s.fetchedAt).getTime() < startOfToday,
      )
      .sort((a, b) => b.fetchedAt.localeCompare(a.fetchedAt))[0];
    const current = Number(rates[p.purity] ?? 0);
    if (!previous || !current) {
      changes[p.purity] = null;
      continue;
    }
    const delta = current - previous.ratePerGram;
    changes[p.purity] = {
      delta,
      pct: previous.ratePerGram ? (delta / previous.ratePerGram) * 100 : 0,
    };
  }

  const updatedAt = latestFeed?.fetchedAt ?? manualUpdatedAt;
  const stale = status === "stale";

  const value: PublicRates = {
    rates,
    status,
    source: latestFeed?.source ?? "manual",
    snapshotId: latestFeed?.id ?? `manual-${updatedAt}`,
    updatedAt,
    fetchedAt: latestFeed?.fetchedAt ?? null,
    stale,
    staleLabel: stale ? `Rate as of ${istLabel(updatedAt)} IST` : null,
    changes,
    pending,
    liveConfigured,
  };
  cache = { at: Date.now(), value };
  return value;
}

export function clearRateCache() {
  cache = null;
}

/* ───────────────────────── refresh / publish ───────────────────────── */

export interface RefreshResult {
  ok: boolean;
  reason?: string;
  published: number;
  pending: { purity: string; ratePerGram: number; previous: number }[];
  fetchedAt?: string;
}

export async function refreshRates(actor = "system"): Promise<RefreshResult> {
  const settings = await getSettings();
  const config = settings.rateConfig;
  if (config.provider === "manual") {
    return { ok: false, reason: "Provider is set to manual.", published: 0, pending: [] };
  }

  const spot =
    config.provider === "free" ? await fetchFreeSpotRates() : await fetchSpotRates();
  if (!spot) {
    return {
      ok: false,
      reason:
        config.provider === "free"
          ? "Free market feed unreachable. Keeping the last published rate."
          : "No METAL_API_KEY configured. Keeping the last published rate.",
      published: 0,
      pending: [],
    };
  }

  const computed = convertSpotToRates(spot, config);
  const currentRows = await getRateRows();
  const current = Object.fromEntries(currentRows.map((r) => [r.purity, r.ratePerGram]));

  let published = 0;
  const pending: RefreshResult["pending"] = [];

  for (const p of PURITIES) {
    const live =
      (p.metal === "GOLD" && config.useLiveFeed.gold) ||
      (p.metal === "SILVER" && config.useLiveFeed.silver);
    if (!live) continue;

    let next = Math.round(computed[p.purity] + config.shopRulePerGram);
    if (next <= 0) continue;
    const previous = Number(current[p.purity] ?? 0);

    if (exceedsGuard(previous, next)) {
      await addSnapshot({
        metal: p.metal,
        purity: p.purity,
        ratePerGram: next,
        source: spot.source,
        fetchedAt: spot.fetchedAt,
        status: "PENDING",
        note: `Feed moved ${(((next - previous) / previous) * 100).toFixed(2)}% — owner approval needed.`,
      });
      pending.push({ purity: p.purity, ratePerGram: next, previous });
      continue;
    }

    await saveRates([{ purity: p.purity, ratePerGram: next }]);
    await addSnapshot({
      metal: p.metal,
      purity: p.purity,
      ratePerGram: next,
      source: spot.source,
      fetchedAt: spot.fetchedAt,
      status: "PUBLISHED",
    });
    await addAudit({
      purity: p.purity,
      oldRate: previous || null,
      newRate: next,
      actor,
      action: "FEED",
      at: new Date().toISOString(),
    });
    published += 1;
  }

  clearRateCache();
  return { ok: true, published, pending, fetchedAt: spot.fetchedAt };
}

export async function publishPendingRate(purity: string, actor: string) {
  const snapshots = await listSnapshots(200);
  const latest = snapshots.find((s) => s.purity === purity && s.status === "PENDING");
  if (!latest) return { ok: false, reason: "No pending rate for this purity." };

  const currentRows = await getRateRows();
  const oldRate = currentRows.find((r) => r.purity === purity)?.ratePerGram ?? null;
  await saveRates([{ purity, ratePerGram: latest.ratePerGram }]);
  await addSnapshot({
    metal: latest.metal,
    purity,
    ratePerGram: latest.ratePerGram,
    source: latest.source,
    fetchedAt: new Date().toISOString(),
    status: "PUBLISHED",
    note: "Owner approved a guarded movement.",
  });
  await addAudit({ purity, oldRate, newRate: latest.ratePerGram, actor, action: "PUBLISH_PENDING", at: new Date().toISOString() });
  clearRateCache();
  return { ok: true, ratePerGram: latest.ratePerGram };
}

export async function publishManualRates(
  updates: { purity: string; ratePerGram: number }[],
  actor: string,
) {
  const currentRows = await getRateRows();
  const current = Object.fromEntries(currentRows.map((r) => [r.purity, r.ratePerGram]));
  await saveRates(updates);

  for (const u of updates) {
    const p = PURITIES.find((x) => x.purity === u.purity);
    await addSnapshot({
      metal: p?.metal ?? "GOLD",
      purity: u.purity,
      ratePerGram: u.ratePerGram,
      source: "MANUAL",
      fetchedAt: new Date().toISOString(),
      status: "MANUAL",
    });
    await addAudit({
      purity: u.purity,
      oldRate: current[u.purity] ?? null,
      newRate: u.ratePerGram,
      actor,
      action: "MANUAL",
      at: new Date().toISOString(),
    });
  }
  clearRateCache();
  return true;
}

export async function saveRateConfig(config: RateConfig, actor: string) {
  const settings = await getSettings();
  await updateSettings({ rateConfig: config });
  await addAudit({
    purity: "CONFIG",
    oldRate: null,
    newRate: Math.round(config.importDutyPct * 100),
    actor,
    action: "CONFIG",
    at: new Date().toISOString(),
  });
  clearRateCache();
  return settings;
}

/* ───────────────────────── admin view ───────────────────────── */

const LABELS: Record<string, string> = {
  "24K": "24K Gold",
  "22K": "22K Gold",
  "18K": "18K Gold",
  SILVER_925: "Silver 92.5",
  SILVER_999: "Silver 99.9",
};

export async function getRateCards(): Promise<RateCard[]> {
  const [rows, snapshots, settings] = await Promise.all([getRateRows(), listSnapshots(200), getSettings()]);

  return PURITIES.map((p) => {
    const row = rows.find((r) => r.purity === p.purity);
    const history = snapshots.filter((s) => s.purity === p.purity).slice(0, 12);
    const feed = history.find((s) => s.source !== "MANUAL");
    const pending = history.find((s) => s.status === "PENDING");
    const live =
      p.metal === "GOLD" ? settings.rateConfig.useLiveFeed.gold : settings.rateConfig.useLiveFeed.silver;
    const staleMinutes = feed
      ? Math.max(0, Math.round((Date.now() - new Date(feed.fetchedAt).getTime()) / 60000))
      : null;

    return {
      metal: p.metal,
      purity: p.purity,
      label: LABELS[p.purity] ?? p.purity,
      shopRate: row?.ratePerGram ?? 0,
      feedRate: feed?.ratePerGram ?? null,
      difference: feed ? (row?.ratePerGram ?? 0) - feed.ratePerGram : null,
      updatedAt: row?.updatedAt ?? new Date().toISOString(),
      pending: pending?.ratePerGram ?? null,
      staleMinutes,
      useLiveFeed: live,
      history,
    };
  });
}

export async function getHistorySeries(days = 30) {
  const since = Date.now() - days * 86400000;
  const snapshots = await listSnapshots(500);
  return snapshots
    .filter((s) => s.status === "PUBLISHED" || s.status === "MANUAL")
    .filter((s) => new Date(s.fetchedAt).getTime() >= since)
    .sort((a, b) => a.fetchedAt.localeCompare(b.fetchedAt));
}

export function formatIst(value: string | null | undefined) {
  if (!value) return "—";
  return `${istLabel(value)} IST`;
}
