"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLang } from "@/components/providers/LangProvider";
import type { RateMap } from "@/lib/pricing";

interface Change {
  delta: number;
  pct: number;
}

interface Payload {
  rates: RateMap;
  status: "live" | "manual" | "stale" | "pending";
  updatedAt: string;
  fetchedAt: string | null;
  staleLabel: string | null;
  changes: Record<string, Change | null>;
}

const inr = (value?: number) => (value ? new Intl.NumberFormat("en-IN").format(value) : "—");
const istTime = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(new Date(value))
    : "—";

/**
 * Slim rate strip under the search bar. Server-rendered first paint, then
 * SWR-style polling every 60 seconds, paused while the tab is hidden. Digits
 * fade for 200ms when they change — no flashing, tabular figures.
 */
export function RateTicker({
  initialRates,
  initialUpdatedAt,
  initialStaleLabel,
}: {
  initialRates: RateMap;
  initialUpdatedAt?: string;
  initialStaleLabel?: string | null;
}) {
  const { isHi } = useLang();
  const [payload, setPayload] = useState<Payload>({
    rates: initialRates,
    status: "manual",
    updatedAt: initialUpdatedAt ?? new Date().toISOString(),
    fetchedAt: null,
    staleLabel: initialStaleLabel ?? null,
    changes: {},
  });
  const [flash, setFlash] = useState(false);
  const last = useRef<string>(JSON.stringify(initialRates));

  useEffect(() => {
    let timer: number | undefined;

    const load = async () => {
      if (document.visibilityState === "hidden") return;
      try {
        const res = await fetch("/api/rates", { cache: "no-store" });
        const data = await res.json();
        if (!data.ok || !data.rates) return;
        const next = JSON.stringify(data.rates);
        if (next !== last.current) {
          last.current = next;
          setFlash(true);
          window.setTimeout(() => setFlash(false), 220);
        }
        setPayload({
          rates: data.rates,
          status: data.status,
          updatedAt: data.updatedAt,
          fetchedAt: data.fetchedAt,
          staleLabel: data.staleLabel,
          changes: data.changes ?? {},
        });
      } catch {
        /* keep the last good rate */
      }
    };

    const schedule = () => {
      window.clearInterval(timer);
      timer = window.setInterval(load, 60_000);
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        load();
        schedule();
      } else {
        window.clearInterval(timer);
      }
    };

    schedule();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const rates = payload.rates;
  const items = [
    { key: "24K", label: isHi ? "सोना 24K" : "Gold 24K", value: rates["24K"], unit: isHi ? "/ग्राम" : "/g" },
    { key: "22K", label: isHi ? "सोना 22K" : "Gold 22K", value: rates["22K"], unit: isHi ? "/ग्राम" : "/g" },
    {
      key: "SILVER_925",
      label: isHi ? "चाँदी" : "Silver",
      value: rates["SILVER_925"] ? rates["SILVER_925"] * 1000 : undefined,
      unit: isHi ? "/किलो" : "/kg",
    },
  ];

  return (
    <Link
      href="/gold-rate"
      className="block border-y border-burgundy/10 bg-cream transition-colors hover:bg-blush/40"
      aria-label="Today's gold and silver rates in Hindaun"
    >
      <div className="no-scrollbar flex items-center gap-4 overflow-x-auto px-4 py-2 sm:justify-center sm:gap-6">
        {items.map((item) => {
          const change = payload.changes[item.key];
          return (
            <span key={item.key} className="inline-flex shrink-0 items-baseline gap-1.5 whitespace-nowrap">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gold-dark">
                {item.label}
              </span>
              <span className={`rate-digits text-[12px] font-semibold text-ink transition-opacity duration-200 ${flash ? "animate-rate-fade" : ""}`}>
                ₹{inr(item.value)}
              </span>
              <span className="text-[10px] text-bodygrey">{item.unit}</span>
              {change && change.delta !== 0 ? (
                <span className={`text-[10px] font-semibold ${change.delta > 0 ? "rate-change-up" : "rate-change-down"}`}>
                  {change.delta > 0 ? "▲" : "▼"} {Math.abs(change.pct).toFixed(2)}%
                </span>
              ) : null}
            </span>
          );
        })}
        <span className="shrink-0 text-[10px] text-bodygrey/90">
          {payload.staleLabel ?? `Updated ${istTime(payload.fetchedAt ?? payload.updatedAt)}`}
        </span>
      </div>
    </Link>
  );
}
