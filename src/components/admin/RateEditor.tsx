"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { IconChevron, IconSparkle } from "@/components/icons/JmdIcons";
import type { RateAudit } from "@/lib/rates";
import type { RateConfig } from "@/lib/settings";
import { cn } from "@/lib/utils";

export interface AdminRateCard {
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
  history: {
    id: string;
    ratePerGram: number;
    source: string;
    fetchedAt: string;
    status: string;
  }[];
}

const fmt = (n: number | null | undefined) =>
  typeof n === "number" ? new Intl.NumberFormat("en-IN").format(n) : "—";

const when = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors",
        checked ? "bg-burgundy" : "bg-bodygrey/25",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-[22px]" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

export function RateEditor({
  cards,
  config,
  audit,
  liveConfigured,
}: {
  cards: AdminRateCard[];
  config: RateConfig;
  audit: RateAudit[];
  liveConfigured: boolean;
}) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, number>>(
    Object.fromEntries(cards.map((c) => [c.purity, c.shopRate])),
  );
  const [cfg, setCfg] = useState<RateConfig>(config);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");

  const goldLive = cfg.useLiveFeed.gold;
  const silverLive = cfg.useLiveFeed.silver;
  const pending = useMemo(() => cards.filter((c) => c.pending != null), [cards]);

  const post = async (body: Record<string, unknown>, key: string) => {
    setBusy(key);
    setMessage("");
    try {
      const res = await fetch("/api/admin/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Action failed");
      setMessage("Saved.");
      router.refresh();
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setBusy("");
    }
  };

  const saveConfig = async (next: RateConfig) => {
    setCfg(next);
    await post({ action: "config", config: next }, "config");
  };

  const publish = (purity: string) =>
    post(
      { action: "manual", updates: [{ purity, ratePerGram: Math.round(Number(values[purity] ?? 0)) }] },
      `publish-${purity}`,
    );

  return (
    <div className="space-y-5">
      {pending.length ? (
        <div className="rounded-card border border-gold/40 bg-peach p-4">
          <p className="flex items-center gap-2 text-[11px] font-semibold text-gold-dark">
            <IconSparkle size={15} /> Movement over 3% held for approval
          </p>
          {pending.map((c) => (
            <div key={c.purity} className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-[12px] bg-white/70 px-3 py-2">
              <span className="text-[11px] text-ink">
                {c.label}: {fmt(c.shopRate)} → <strong>{fmt(c.pending)}</strong>
                {c.feedRate ? <span className="ml-2 text-bodygrey">feed {fmt(c.feedRate)}</span> : null}
              </span>
              <button
                type="button"
                disabled={busy === `approve-${c.purity}`}
                onClick={() => post({ action: "publish", purity: c.purity }, `approve-${c.purity}`)}
                className="btn-copper min-h-9 px-3 text-[9px]"
              >
                Approve rate
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {!liveConfigured ? (
        <p className="rounded-card border border-burgundy/10 bg-white px-4 py-3 text-[11px] text-bodygrey">
          {cfg.provider === "metals-api" || cfg.provider === "goldpricez" ? (
            <>
              No{" "}
              <code className="text-burgundy">
                {cfg.provider === "goldpricez" ? "GOLDPRICEZ_API_KEY" : "METAL_API_KEY"}
              </code>{" "}
              is set. The site is using the shop rates below. Live feed rows stay empty until a key is configured — or
              switch the rate source to the free feed.
            </>
          ) : (
            <>
              Manual mode: the site uses only the shop rates you enter below. Pick the free live market feed above to
              follow the market automatically.
            </>
          )}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {cards.map((card) => {
          const stale = card.staleMinutes != null && card.staleMinutes > 30;
          return (
            <div key={card.purity} className="rounded-card border border-burgundy/10 bg-white p-4 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-serif text-[19px] font-semibold text-ink">{card.label}</h2>
                  <p className="mt-0.5 text-[10px] text-bodygrey">
                    Feed {fmt(card.feedRate)} · Shop {fmt(card.shopRate)}
                    {card.difference != null ? (
                      <span className={card.difference >= 0 ? " text-whatsapp" : " text-burgundy"}>
                        {" "}
                        ({card.difference >= 0 ? "+" : ""}
                        {fmt(card.difference)})
                      </span>
                    ) : null}
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-control px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.1em]",
                    card.useLiveFeed && liveConfigured
                      ? stale
                        ? "bg-peach text-gold-dark"
                        : "bg-[#E7F4EC] text-whatsapp"
                      : "bg-blush text-burgundy",
                  )}
                >
                  {card.useLiveFeed && liveConfigured ? (stale ? "Stale feed" : "Live feed") : "Manual"}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between rounded-[14px] bg-cream px-3 py-2">
                <span className="text-[10px] uppercase tracking-[0.1em] text-gold-dark">Use live feed</span>
                <Toggle
                  checked={card.useLiveFeed}
                  label={`Use live feed for ${card.label}`}
                  onChange={(value) => {
                    const next: RateConfig = {
                      ...cfg,
                      useLiveFeed: {
                        ...cfg.useLiveFeed,
                        [card.metal === "GOLD" ? "gold" : "silver"]: value,
                      },
                    };
                    void saveConfig(next);
                  }}
                />
              </div>

              <div className="mt-3 flex items-end gap-2">
                <label className="flex-1">
                  <span className="text-[10px] uppercase tracking-[0.1em] text-bodygrey">Shop rate / gram</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={values[card.purity] ?? 0}
                    onChange={(e) => setValues({ ...values, [card.purity]: Number(e.target.value) })}
                    className="field mt-1 py-2 text-right text-[13px]"
                  />
                </label>
                <button
                  type="button"
                  disabled={busy === `publish-${card.purity}`}
                  onClick={() => publish(card.purity)}
                  className="btn-copper min-h-11 px-4 text-[9px]"
                >
                  Publish
                </button>
              </div>

              <div className="mt-3 border-t border-burgundy/10 pt-2">
                <p className="text-[9px] uppercase tracking-[0.1em] text-bodygrey">Recent snapshots</p>
                <ul className="mt-1 space-y-1">
                  {card.history.slice(0, 4).map((h) => (
                    <li key={h.id} className="flex justify-between gap-2 text-[10px] text-bodygrey">
                      <span>
                        {when(h.fetchedAt)} · {h.source}
                        {h.status === "PENDING" ? " · pending" : ""}
                      </span>
                      <span className="tabular-nums text-ink">₹{fmt(h.ratePerGram)}</span>
                    </li>
                  ))}
                  {card.history.length === 0 ? <li className="text-[10px] text-bodygrey">No snapshots yet.</li> : null}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-card border border-burgundy/10 bg-white p-4 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-serif text-[19px] font-semibold text-ink">India adjustment &amp; rate rule</h2>
            <p className="text-[10px] text-bodygrey">
              These values are owner-controlled. Nothing is hard-coded in the conversion.
            </p>
          </div>
          <button
            type="button"
            disabled={busy === "refresh"}
            onClick={() => post({ action: "refresh" }, "refresh")}
            className="btn-outline min-h-10 px-4 text-[9px]"
          >
            {busy === "refresh" ? "Refreshing…" : "Refresh feed now"}
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label>
            <span className="text-[10px] uppercase tracking-[0.1em] text-bodygrey">Rate source</span>
            <select
              value={cfg.provider}
              onChange={(e) => setCfg({ ...cfg, provider: e.target.value as RateConfig["provider"] })}
              className="field mt-1 py-2 text-[13px]"
            >
              <option value="goldpricez">Goldpricez (free tier, key required)</option>
              <option value="manual">Manual rates only</option>
              <option value="free">Free live market feed (no key)</option>
              <option value="metals-api">Metals-API (key required)</option>
            </select>
          </label>
          <label>
            <span className="text-[10px] uppercase tracking-[0.1em] text-bodygrey">Import duty %</span>
            <input
              type="number"
              min={0}
              max={100}
              step="0.01"
              value={cfg.importDutyPct}
              onChange={(e) => setCfg({ ...cfg, importDutyPct: Number(e.target.value) })}
              className="field mt-1 py-2 text-right text-[13px]"
            />
          </label>
          <label>
            <span className="text-[10px] uppercase tracking-[0.1em] text-bodygrey">Premium ₹ / gram</span>
            <input
              type="number"
              min={0}
              step="1"
              value={cfg.premiumPerGram}
              onChange={(e) => setCfg({ ...cfg, premiumPerGram: Number(e.target.value) })}
              className="field mt-1 py-2 text-right text-[13px]"
            />
          </label>
          <label>
            <span className="text-[10px] uppercase tracking-[0.1em] text-bodygrey">Shop = feed + ₹ / gram</span>
            <input
              type="number"
              step="1"
              value={cfg.shopRulePerGram}
              onChange={(e) => setCfg({ ...cfg, shopRulePerGram: Number(e.target.value) })}
              className="field mt-1 py-2 text-right text-[13px]"
            />
          </label>
        </div>

        <button
          type="button"
          disabled={busy === "config"}
          onClick={() => void saveConfig(cfg)}
          className="btn-copper mt-4 w-full sm:w-auto"
        >
          Save adjustment
        </button>
        <p className="mt-2 text-[10px] text-bodygrey">
          <strong>
            {cfg.provider === "free"
              ? "Free market feed"
              : cfg.provider === "goldpricez"
                ? "Goldpricez spot feed"
                : cfg.provider === "metals-api"
                  ? "Metals-API spot feed"
                  : "Manual only"}
          </strong>
          . Live feeds read XAU/USD, XAG/USD and USD/INR, then convert per troy ounce (31.1035 g). Goldpricez is
          cached for 3 minutes on the server (≈20 calls/hour, inside the free tier) and USD/INR for an hour; the
          storefront polls only that cache every 45 seconds.
        </p>
      </div>

      <div className="rounded-card border border-burgundy/10 bg-white p-4 shadow-card">
        <h2 className="font-serif text-[19px] font-semibold text-ink">Change history</h2>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-[11px]">
            <thead className="text-[9px] uppercase tracking-[0.1em] text-bodygrey">
              <tr>
                <th className="py-1.5">When</th>
                <th className="py-1.5">Purity</th>
                <th className="py-1.5 text-right">Old</th>
                <th className="py-1.5 text-right">New</th>
                <th className="py-1.5">Action</th>
                <th className="py-1.5">By</th>
              </tr>
            </thead>
            <tbody>
              {audit.slice(0, 12).map((row) => (
                <tr key={row.id} className="border-t border-burgundy/8">
                  <td className="py-1.5 text-bodygrey">{when(row.at)}</td>
                  <td className="py-1.5">{row.purity}</td>
                  <td className="py-1.5 text-right tabular-nums">{fmt(row.oldRate)}</td>
                  <td className="py-1.5 text-right tabular-nums">{fmt(row.newRate)}</td>
                  <td className="py-1.5">{row.action}</td>
                  <td className="py-1.5 text-bodygrey">{row.actor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {message ? <p className="mt-2 text-[10px] text-burgundy">{message}</p> : null}
        <p className="mt-2 flex items-center gap-1 text-[10px] text-bodygrey">
          Shop rate = feed rate + rule. <IconChevron size={11} /> Prices recalculate server-side on every quote.
        </p>
      </div>
    </div>
  );
}
