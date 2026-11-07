import { compactInr } from "@/lib/pricing";

export function SalesChart({ days }: { days: { label: string; value: number }[] }) {
  const max = Math.max(1, ...days.map((d) => d.value));
  return (
    <div>
      <div className="flex h-[180px] items-end gap-1.5">
        {days.map((d) => (
          <div key={d.label} className="group relative flex flex-1 flex-col items-center justify-end">
            <div
              className="w-full bg-gradient-to-t from-copper-dark/70 to-copper transition-opacity group-hover:opacity-80"
              style={{ height: `${Math.max(3, (d.value / max) * 100)}%` }}
            />
            <span className="pointer-events-none absolute -top-8 hidden whitespace-nowrap border border-copper/25 bg-white/[0.04] px-2 py-1 text-[9px] text-charcoal shadow-soft group-hover:block">
              {compactInr(d.value)}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[8.5px] uppercase tracking-wider text-stone">
        <span>{days[0]?.label}</span>
        <span>14-day revenue</span>
        <span>{days[days.length - 1]?.label}</span>
      </div>
    </div>
  );
}
