"use client";

import { useEffect, useRef, useState } from "react";
import { computeBreakup, inr, rateKey, type MetalKind } from "@/lib/pricing";
import { rateBeforeToday, useLiveRates } from "@/components/providers/LiveRatesProvider";
import { cn } from "@/lib/utils";

/**
 * The price of a piece, recomputed in the browser from the live rate.
 *
 *  - rate up   → digits flash green, ▲
 *  - rate down → digits flash red,  ▼
 *  - the struck price is what the same piece cost at the previous rate, so it
 *    is a real number from our own rate history, never an invented MRP.
 */
export function LivePrice({
  metal,
  purity,
  weight,
  makingPct,
  gemstoneValue,
  quantity = 1,
  size = "md",
  showStrike = true,
  showPerGram = true,
  className,
}: {
  metal: MetalKind | string;
  purity: string;
  weight: number;
  makingPct: number;
  gemstoneValue: number;
  quantity?: number;
  size?: "sm" | "md" | "lg";
  showStrike?: boolean;
  showPerGram?: boolean;
  className?: string;
}) {
  const live = useLiveRates();
  const key = rateKey(metal, purity);
  const before = rateBeforeToday(live, key);

  const now = computeBreakup({ metal, purity, weight, gemstoneValue, makingPct, quantity }, live.rates);
  const then =
    typeof before === "number"
      ? computeBreakup(
          { metal, purity, weight, gemstoneValue, makingPct, quantity },
          { ...live.rates, [key]: before },
        )
      : null;

  const direction: "up" | "down" | "idle" =
    then === null ? "idle" : now.total > then.total ? "up" : now.total < then.total ? "down" : "idle";

  const [flash, setFlash] = useState<"up" | "down" | null>(null);
  const lastTotal = useRef(now.total);

  useEffect(() => {
    if (now.total === lastTotal.current) return;
    const next = now.total > lastTotal.current ? "up" : "down";
    lastTotal.current = now.total;
    setFlash(next);
    const timer = window.setTimeout(() => setFlash(null), 1100);
    return () => window.clearTimeout(timer);
  }, [now.total]);

  const perGram = typeof before === "number" ? Math.round(now.ratePerGram - before) : 0;
  const sizes = {
    sm: "text-16",
    md: "text-20",
    lg: "text-28 sm:text-[32px]",
  } as const;

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span
          className={cn(
            "rate-digits font-serif leading-none text-ink",
            sizes[size],
            flash === "up" && "price-flash-up",
            flash === "down" && "price-flash-down",
          )}
        >
          {inr(now.total)}
        </span>
        {showStrike && then && then.total !== now.total ? (
          <span
            className="rate-digits pb-0.5 text-[12px] text-bodygrey/85 line-through"
            title="What this piece cost at the previous rate"
          >
            {inr(then.total)}
          </span>
        ) : null}
      </div>

      {showPerGram && perGram !== 0 ? (
        <span
          className={cn(
            "mt-1 inline-flex w-fit items-center gap-1 text-[10.5px] font-semibold",
            perGram > 0 ? "rate-change-up" : "rate-change-down",
          )}
        >
          <span aria-hidden>{perGram > 0 ? "▲" : "▼"}</span>
          {inr(Math.abs(perGram))}/g {perGram > 0 ? "more" : "less"} than the previous rate
        </span>
      ) : null}

      {showPerGram && perGram === 0 && direction === "idle" ? (
        <span className="mt-1 text-[10.5px] text-bodygrey">
          {inr(now.ratePerGram)}/g for {purity} · updates with the live rate
        </span>
      ) : null}
    </div>
  );
}
