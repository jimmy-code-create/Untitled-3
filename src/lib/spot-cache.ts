/**
 * Upstream spot cache (server only).
 *
 * One snapshot of gold/silver in USD per troy ounce, refreshed at most every
 * three minutes, plus USD→INR cached for an hour. Both live in module memory,
 * so a busy morning of traffic still makes ~20 upstream calls per hour — well
 * inside Goldpricez's free tier of 30–60/hour.
 *
 * On any upstream error we keep serving the last good snapshot and flag it
 * `stale`, which the UI turns into a plain "Updated 9:31 AM" line instead of a
 * broken rate.
 */

import { RATE_PROVIDER, type ProviderName } from "./rate-provider-config";

export interface SpotSnapshot {
  /** USD per troy ounce. */
  xauUsdOz: number;
  /** USD per troy ounce. */
  xagUsdOz: number;
  usdInr: number;
  fetchedAt: string;
  source: string;
  /** True when the upstream call failed and this is the last good value. */
  stale: boolean;
}

interface MetalsCache {
  at: number;
  xauUsdOz: number;
  xagUsdOz: number;
  fetchedAt: string;
  source: string;
}

let metalsCache: MetalsCache | null = null;
let fxCache: { at: number; value: number; source: string } | null = null;
let lastError: string | null = null;

const num = (value: unknown): number => {
  const n = typeof value === "string" ? Number(value.replace(/,/g, "")) : Number(value);
  return Number.isFinite(n) ? n : 0;
};

const inFlight = new Map<string, Promise<unknown>>();

/** Collapse concurrent refreshes so a traffic spike is still one upstream call. */
function once<T>(key: string, run: () => Promise<T>): Promise<T> {
  const existing = inFlight.get(key);
  if (existing) return existing as Promise<T>;
  const promise = run().finally(() => inFlight.delete(key));
  inFlight.set(key, promise);
  return promise;
}

/* ───────────────────────────── providers ───────────────────────────── */

/**
 * Goldpricez: gold and silver spot in USD per troy ounce.
 * `ounce_price_usd` / `silver_ounce_price_usd` are the fields we use, with the
 * gram fields × 31.1035 as a fallback.
 */
async function fetchGoldpricez(key: string): Promise<{ xauUsdOz: number; xagUsdOz: number }> {
  const config = RATE_PROVIDER.providers.goldpricez;
  const res = await fetch(config.endpoint, {
    cache: "no-store",
    headers: { [config.authHeader]: key, accept: "application/json" },
    signal: AbortSignal.timeout(8_000),
  });
  if (!res.ok) throw new Error(`Goldpricez responded ${res.status}`);
  const json: any = await res.json();
  if (json?.error) throw new Error(String(json?.message ?? `Goldpricez error ${json?.code ?? ""}`));

  const goldOz =
    num(json.ounce_price_usd) || num(json.ounce_in_usd) || num(json.gram_in_usd) * 31.1035;
  const silverOz =
    num(json.silver_ounce_price_usd) ||
    num(json.silver_ounce_in_usd) ||
    num(json.silver_gram_in_usd) * 31.1035;

  if (!(goldOz > 0)) throw new Error("Goldpricez returned no gold price");
  if (!(silverOz > 0)) throw new Error("Goldpricez returned no silver price");
  return { xauUsdOz: goldOz, xagUsdOz: silverOz };
}

/** Metals-API shape: units per USD, so USD/XAU = 1 / rates.XAU. */
async function fetchMetalsApi(key: string): Promise<{ xauUsdOz: number; xagUsdOz: number }> {
  const endpoint = process.env.METAL_API_URL || RATE_PROVIDER.providers["metals-api"].endpoint;
  const url = new URL(endpoint);
  url.searchParams.set("access_key", key);
  url.searchParams.set("base", "USD");
  url.searchParams.set("symbols", "XAU,XAG,INR");

  const res = await fetch(url.toString(), {
    cache: "no-store",
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(8_000),
  });
  if (!res.ok) throw new Error(`Metals-API responded ${res.status}`);
  const json: any = await res.json();
  if (json?.success === false) {
    throw new Error(String(json?.error?.info ?? "Metals-API rejected the request"));
  }
  const xau = num(json?.rates?.XAU);
  const xag = num(json?.rates?.XAG);
  if (!(xau > 0) || !(xag > 0)) throw new Error("Metals-API returned no metals data");
  return { xauUsdOz: 1 / xau, xagUsdOz: 1 / xag };
}

/** Keyless fallback: Yahoo continuous futures. */
async function fetchYahoo(symbol: string): Promise<number> {
  const res = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1d`,
    {
      cache: "no-store",
      headers: { "user-agent": "Mozilla/5.0", accept: "application/json" },
      signal: AbortSignal.timeout(8_000),
    },
  );
  if (!res.ok) throw new Error(`Yahoo ${symbol} responded ${res.status}`);
  const json: any = await res.json();
  const price = num(json?.chart?.result?.[0]?.meta?.regularMarketPrice);
  if (!(price > 0)) throw new Error(`Yahoo ${symbol} returned no price`);
  return price;
}

async function fetchMetals(
  provider: ProviderName,
): Promise<{ xauUsdOz: number; xagUsdOz: number; source: string }> {
  if (provider === "goldpricez") {
    const key = process.env[RATE_PROVIDER.providers.goldpricez.envKey];
    if (!key) throw new Error("GOLDPRICEZ_API_KEY is not set");
    return { ...(await fetchGoldpricez(key)), source: "goldpricez" };
  }
  if (provider === "metals-api") {
    const key = process.env[RATE_PROVIDER.providers["metals-api"].envKey];
    if (!key) throw new Error("METAL_API_KEY is not set");
    return { ...(await fetchMetalsApi(key)), source: "metals-api" };
  }
  if (provider === "free") {
    const [xauUsdOz, xagUsdOz] = await Promise.all([fetchYahoo("GC=F"), fetchYahoo("SI=F")]);
    return { xauUsdOz, xagUsdOz, source: "free-market" };
  }
  throw new Error("Provider is set to manual");
}

/* ──────────────────────────────── FX ──────────────────────────────── */

async function fetchUsdInr(): Promise<{ value: number; source: string }> {
  const res = await fetch(RATE_PROVIDER.fx.endpoint, {
    cache: "no-store",
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(8_000),
  });
  if (!res.ok) throw new Error(`Forex API responded ${res.status}`);
  const json: any = await res.json();
  const rate = num(json?.rates?.INR);
  if (!(rate > 0)) throw new Error("Forex API returned no INR rate");
  return { value: rate, source: "frankfurter" };
}

function fallbackUsdInr(): number {
  const configured = num(process.env[RATE_PROVIDER.fx.envKey]);
  return configured > 0 ? configured : RATE_PROVIDER.fx.fallbackUsdInr;
}

/* ─────────────────────────────── public ─────────────────────────────── */

/**
 * Read the spot snapshot. Metals refresh at most every 3 minutes (1 hour for
 * FX); a failed refresh returns the previous snapshot with `stale: true`
 * instead of throwing, so callers always have a usable rate.
 */
export async function readSpot(provider: ProviderName): Promise<SpotSnapshot | null> {
  if (provider === "manual") return null;

  const now = Date.now();
  let metals = metalsCache;
  let refreshFailed = false;

  if (!metals || now - metals.at >= RATE_PROVIDER.cache.spotTtlMs) {
    try {
      const fresh = await once(`metals:${provider}`, () => fetchMetals(provider));
      metals = { ...fresh, at: now, fetchedAt: new Date(now).toISOString() };
      metalsCache = metals;
      lastError = null;
    } catch (error) {
      lastError = (error as Error).message;
      refreshFailed = true;
      // fall through with the previous good snapshot
    }
  }

  if (!metals) return null;

  let fx = fxCache;
  if (!fx || now - fx.at >= RATE_PROVIDER.cache.fxTtlMs) {
    try {
      const fresh = await once("fx:usd-inr", fetchUsdInr);
      fx = { ...fresh, at: now };
      fxCache = fx;
    } catch {
      // config value (or the last good FX) — never block a rate on forex
      fx = fx ?? { at: now, value: fallbackUsdInr(), source: "fallback" };
      fxCache = fx;
    }
  }

  return {
    xauUsdOz: metals.xauUsdOz,
    xagUsdOz: metals.xagUsdOz,
    usdInr: fx.value,
    fetchedAt: metals.fetchedAt,
    source: metals.source,
    stale: refreshFailed || now - metals.at > RATE_PROVIDER.cache.staleGraceMs,
  };
}

/** Diagnostics for /admin/rates and health checks. */
export function spotCacheMeta() {
  return {
    metalsCachedAt: metalsCache?.fetchedAt ?? null,
    metalsSource: metalsCache?.source ?? null,
    fxCachedAt: fxCache ? new Date(fxCache.at).toISOString() : null,
    fxSource: fxCache?.source ?? null,
    lastError,
    spot: RATE_PROVIDER.providers.goldpricez.label,
    spotTtlMs: RATE_PROVIDER.cache.spotTtlMs,
    fxTtlMs: RATE_PROVIDER.cache.fxTtlMs,
  };
}
