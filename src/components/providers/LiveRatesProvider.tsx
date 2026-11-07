"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { RateMap } from "@/lib/pricing";
import { RATE_PROVIDER } from "@/lib/rate-provider-config";

/**
 * One poller for the whole app.
 *
 * Every price on the site is weight × rate, so when the rate moves, the price
 * moves. This provider polls only our own /api/rates proxy every 45 seconds
 * (paused while the tab is hidden) — never the metal feed itself — keeps the
 * previous rate so cards can show a struck "at the old rate" price, and exposes
 * which purities actually changed so digits flash green (up) or red (down).
 */

export type Movement = "up" | "down";

export interface DayChange {
  delta: number;
  pct: number;
}

export interface LiveRatesValue {
  rates: RateMap;
  /** Rates as they were before the most recent tick / today's opening rate. */
  previous: RateMap;
  /** Day-over-day change reported by the rates engine. */
  dayChanges: Record<string, DayChange | null>;
  /** Purities that moved on the last tick — cleared after ~1.8s. */
  moved: Record<string, Movement>;
  status: "live" | "manual" | "stale" | "pending";
  updatedAt: string;
  fetchedAt: string | null;
  staleLabel: string | null;
  /** Increments on every tick, so components can re-trigger an animation. */
  tick: number;
}

const FALLBACK: LiveRatesValue = {
  rates: {},
  previous: {},
  dayChanges: {},
  moved: {},
  status: "manual",
  updatedAt: new Date().toISOString(),
  fetchedAt: null,
  staleLabel: null,
  tick: 0,
};

const LiveRatesContext = createContext<LiveRatesValue | null>(null);

export function useLiveRates(): LiveRatesValue {
  return useContext(LiveRatesContext) ?? FALLBACK;
}

/** The rate that applied before today's move — used for the struck price. */
export function rateBeforeToday(value: LiveRatesValue, key: string): number | undefined {
  const current = value.rates[key];
  const change = value.dayChanges[key];
  if (typeof current === "number" && change && change.delta !== 0) {
    return Math.round((current - change.delta) * 100) / 100;
  }
  const previous = value.previous[key];
  return typeof previous === "number" ? previous : undefined;
}

export function LiveRatesProvider({
  initialRates,
  initialUpdatedAt,
  initialStaleLabel,
  children,
}: {
  initialRates: RateMap;
  initialUpdatedAt?: string;
  initialStaleLabel?: string | null;
  children: React.ReactNode;
}) {
  const [value, setValue] = useState<LiveRatesValue>({
    rates: initialRates,
    previous: initialRates,
    dayChanges: {},
    moved: {},
    status: "manual",
    updatedAt: initialUpdatedAt ?? new Date().toISOString(),
    fetchedAt: null,
    staleLabel: initialStaleLabel ?? null,
    tick: 0,
  });

  const last = useRef<RateMap>(initialRates);
  const tick = useRef(0);
  const clearTimer = useRef<number | undefined>(undefined);

  const load = useCallback(async () => {
    if (typeof document === "undefined" || document.visibilityState === "hidden") return;
    try {
      const res = await fetch("/api/rates", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (!data?.ok || !data.rates) return;

      const next = data.rates as RateMap;
      const prev = last.current;
      const moved: Record<string, Movement> = {};
      for (const key of Object.keys(next)) {
        const a = prev[key];
        const b = next[key];
        if (typeof a === "number" && typeof b === "number" && a !== b) {
          moved[key] = b > a ? "up" : "down";
        }
      }
      last.current = next;
      tick.current += 1;

      setValue((current) => ({
        rates: next,
        previous: Object.keys(moved).length ? prev : current.previous,
        dayChanges: data.changes ?? current.dayChanges,
        moved,
        status: data.status ?? current.status,
        updatedAt: data.updatedAt ?? current.updatedAt,
        fetchedAt: data.fetchedAt ?? current.fetchedAt,
        staleLabel: data.staleLabel ?? null,
        tick: tick.current,
      }));

      if (Object.keys(moved).length) {
        window.clearTimeout(clearTimer.current);
        clearTimer.current = window.setTimeout(
          () => setValue((current) => ({ ...current, moved: {} })),
          1800,
        );
      }
    } catch {
      /* offline — keep the last good rate on screen */
    }
  }, []);

  useEffect(() => {
    let timer: number | undefined;

    const schedule = () => {
      window.clearInterval(timer);
      timer = window.setInterval(load, RATE_PROVIDER.cache.clientPollMs);
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        void load();
        schedule();
      } else {
        window.clearInterval(timer);
      }
    };

    void load();
    schedule();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(clearTimer.current);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [load]);

  const stable = useMemo(() => value, [value]);

  return <LiveRatesContext.Provider value={stable}>{children}</LiveRatesContext.Provider>;
}
