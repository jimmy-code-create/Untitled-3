"use client";

import Link from "next/link";
import { useLang } from "@/components/providers/LangProvider";
import { useLiveRates } from "@/components/providers/LiveRatesProvider";
import { cn } from "@/lib/utils";

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
 * Live rate strip under the masthead.
 *
 * Reads the shared rate poller, so the strip and every price on the page move
 * together. A rising rate flashes green with ▲, a falling rate flashes red
 * with ▼, and the last update time is always on screen.
 */
export function RateTicker() {
  const { isHi } = useLang();
  const live = useLiveRates();
  const rates = live.rates;

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
      className="block border-y border-white/10 bg-black transition-colors hover:bg-blush/40"
      aria-label="Today's live gold and silver rates in Hindaun"
    >
      <div className="no-scrollbar flex items-center gap-4 overflow-x-auto px-4 py-2 sm:justify-center sm:gap-6">
        <span className="inline-flex shrink-0 items-center gap-1.5">
          <span className={cn("live-dot", live.status === "live" ? "live-dot-on" : "live-dot-manual")} aria-hidden />
          <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-gold-dark">
            {live.status === "live" ? (isHi ? "लाइव" : "Live") : isHi ? "आज का भाव" : "Today"}
          </span>
        </span>

        {items.map((item) => {
          const move = live.moved[item.key];
          const change = live.dayChanges[item.key];
          return (
            <span key={item.key} className="inline-flex shrink-0 items-baseline gap-1.5 whitespace-nowrap">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gold-dark">{item.label}</span>
              <span
                key={`${item.key}-${live.tick}`}
                className={cn(
                  "rate-digits text-[12.5px] font-semibold text-ink",
                  move === "up" && "price-flash-up",
                  move === "down" && "price-flash-down",
                )}
              >
                ₹{inr(item.value)}
              </span>
              <span className="text-[10px] text-bodygrey">{item.unit}</span>
              {change && change.delta !== 0 ? (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9.5px] font-semibold",
                    change.delta > 0 ? "rate-change-up bg-whatsapp/10" : "rate-change-down bg-[#B3261E]/10",
                  )}
                >
                  <span aria-hidden>{change.delta > 0 ? "▲" : "▼"}</span>
                  {Math.abs(change.pct).toFixed(2)}%
                </span>
              ) : null}
            </span>
          );
        })}

        <span className="shrink-0 text-[10px] text-bodygrey/90">
          {live.staleLabel ?? `${isHi ? "अपडेट" : "Updated"} ${istTime(live.fetchedAt ?? live.updatedAt)}`}
        </span>
      </div>
    </Link>
  );
}
