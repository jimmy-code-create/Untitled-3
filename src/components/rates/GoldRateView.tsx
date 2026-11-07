"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { inr } from "@/lib/pricing";
import type { PublicRates, RateChange } from "@/lib/rates";

const ROWS = [
  { key: "24K", label: "24K Gold", hi: "24K सोना" },
  { key: "22K", label: "22K Gold", hi: "22K सोना" },
  { key: "18K", label: "18K Gold", hi: "18K सोना" },
  { key: "SILVER_999", label: "Silver 99.9", hi: "चाँदी 99.9" },
  { key: "SILVER_925", label: "Silver 92.5", hi: "चाँदी 92.5" },
];

const GRAMS = [1, 8, 10, 100];

type SeriesPoint = { purity: string; ratePerGram: number; fetchedAt: string };

function istTime(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(value));
}

function formatRate(value?: number) {
  return value ? new Intl.NumberFormat("en-IN").format(value) : "—";
}

function ChangeCell({ change }: { change?: RateChange | null }) {
  if (!change || change.delta === 0) return <span className="text-bodygrey/60">—</span>;
  return (
    <span className={change.delta > 0 ? "rate-change-up" : "rate-change-down"}>
      {change.delta > 0 ? "▲" : "▼"} ₹{formatRate(Math.abs(change.delta))}
      <span className="ml-1 text-[10px] opacity-70">({Math.abs(change.pct).toFixed(2)}%)</span>
    </span>
  );
}

function Chart({ points }: { points: SeriesPoint[] }) {
  const series = points
    .filter((p) => p.purity === "24K")
    .sort((a, b) => a.fetchedAt.localeCompare(b.fetchedAt));

  if (series.length < 2) {
    return (
      <div className="flex h-[180px] items-center justify-center rounded-photo border border-white/10 bg-white/[0.04] px-6 text-center">
        <p className="text-[12px] text-bodygrey">
          The 30-day chart starts building from the first saved rate snapshot. No history is invented.
        </p>
      </div>
    );
  }

  const width = 640;
  const height = 200;
  const pad = 18;
  const values = series.map((p) => p.ratePerGram);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1, max - min);
  const step = series.length > 1 ? (width - pad * 2) / (series.length - 1) : 0;
  const coords = series.map((p, i) => {
    const x = pad + i * step;
    const y = height - pad - ((p.ratePerGram - min) / range) * (height - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return (
    <div className="rounded-photo border border-white/10 bg-white/[0.04] p-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label="24K gold rate, last 30 days">
        <rect width={width} height={height} fill="#0B0B0B" rx="12" />
        {[0, 0.5, 1].map((f) => (
          <line
            key={f}
            x1={pad}
            x2={width - pad}
            y1={pad + f * (height - pad * 2)}
            y2={pad + f * (height - pad * 2)}
            stroke="#7A1F2B"
            strokeOpacity="0.08"
          />
        ))}
        <polyline
          points={coords.join(" ")}
          fill="none"
          stroke="#B07A2A"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <circle
          cx={pad + (series.length - 1) * step}
          cy={height - pad - ((values[values.length - 1] - min) / range) * (height - pad * 2)}
          r="4"
          fill="#7A1F2B"
        />
        <text x={pad} y={height - 4} fontSize="10" fill="#5C5457">
          {new Date(series[0].fetchedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
        </text>
        <text x={width - pad} y={height - 4} textAnchor="end" fontSize="10" fill="#5C5457">
          {new Date(series[series.length - 1].fetchedAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
          })}
        </text>
        <text x={pad} y={pad + 4} fontSize="10" fill="#5C5457">
          ₹{formatRate(max)}
        </text>
        <text x={pad} y={height - pad - 2} fontSize="10" fill="#5C5457">
          ₹{formatRate(min)}
        </text>
      </svg>
    </div>
  );
}

export function GoldRateView({
  initial,
  history,
}: {
  initial: PublicRates;
  history: SeriesPoint[];
}) {
  const [payload, setPayload] = useState(initial);
  const [flash, setFlash] = useState(false);
  const last = useRef(JSON.stringify(initial.rates));

  useEffect(() => {
    let timer: number | undefined;
    const load = async () => {
      if (document.visibilityState === "hidden") return;
      try {
        const res = await fetch("/api/rates", { cache: "no-store" });
        const data = await res.json();
        if (!data.ok) return;
        const serialised = JSON.stringify(data.rates);
        if (serialised !== last.current) {
          last.current = serialised;
          setFlash(true);
          window.setTimeout(() => setFlash(false), 220);
        }
        setPayload((prev) => ({ ...prev, ...data }));
      } catch {
        /* keep last */
      }
    };
    timer = window.setInterval(load, 60_000);
    const onVisibility = () => {
      if (document.visibilityState === "visible") load();
      else window.clearInterval(timer);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div className="bg-black pb-16">
      <div className="container-x">
        <div className="mx-auto max-w-[760px] pt-8 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-dark">
            Hindaun · Rajasthan
          </p>
          <h1 className="mt-2 font-serif text-28 font-semibold text-ink sm:text-34">
            Today&apos;s Gold Rate in Hindaun
          </h1>
          <p className="mt-1 font-hindi text-[13px] text-bodygrey">आज का सोना-चाँदी भाव, हिंडौन</p>
          <p className="mt-2 text-[11px] text-bodygrey">
            {payload.staleLabel ??
              `${payload.status === "live" ? "Live rate" : "Shop rate"} · updated ${istTime(payload.fetchedAt ?? payload.updatedAt)}`}
          </p>
        </div>

        <div className="mx-auto mt-6 max-w-[760px] overflow-hidden rounded-card border border-white/10 bg-white/[0.04] shadow-card">
          <div className="overflow-x-auto">
            <table className={`rate-digits w-full min-w-[560px] text-left text-[12px] transition-opacity duration-200 ${flash ? "animate-rate-fade" : ""}`}>
              <thead>
                <tr className="border-b border-white/10 bg-blush/40 text-[10px] uppercase tracking-[0.1em] text-gold-dark">
                  <th className="px-4 py-3 font-semibold">Metal</th>
                  {GRAMS.map((g) => (
                    <th key={g} className="px-3 py-3 text-right font-semibold">
                      {g}g
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right font-semibold">Change</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => {
                  const perGram = payload.rates[row.key];
                  return (
                    <tr key={row.key} className="border-b border-burgundy/8 last:border-0">
                      <th className="px-4 py-3 text-left font-medium text-ink">
                        {row.label}
                        <span className="mt-0.5 block font-hindi text-[10px] font-normal text-bodygrey">
                          {row.hi}
                        </span>
                      </th>
                      {GRAMS.map((g) => (
                        <td key={g} className="px-3 py-3 text-right text-ink">
                          {perGram ? inr(perGram * g) : "—"}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-right">
                        <ChangeCell change={payload.changes[row.key]} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-[760px]">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h2 className="font-serif text-20 font-semibold text-ink">24K gold · 30 days</h2>
              <p className="text-[10px] text-bodygrey">Copper line on ivory. Only saved snapshots are plotted.</p>
            </div>
            <Link href="/gold-rate-disclaimer" className="text-[10px] font-semibold uppercase tracking-[0.1em] text-gold-dark underline underline-offset-4">
              Disclaimer
            </Link>
          </div>
          <Chart points={history} />
        </div>

        <div className="mx-auto mt-6 max-w-[760px] rounded-photo border border-white/10 bg-peach px-5 py-4">
          <p className="text-[11px] leading-relaxed text-bodygrey">
            <strong className="text-ink">Disclaimer:</strong> Rates are indicative. Final price is as per billing
            at the shop.
          </p>
          <p className="mt-1 text-[10px] text-bodygrey/80">
            GST and making charges are shown separately on every product and invoice.
          </p>
        </div>
      </div>
    </div>
  );
}
