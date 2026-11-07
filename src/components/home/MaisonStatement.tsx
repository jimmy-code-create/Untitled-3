import { cn } from "@/lib/utils";

/**
 * The quiet statement that separates the film from the collection grid —
 * serif with one italic word, exactly as the reference does it.
 */
export function MaisonStatement() {
  return (
    <section className="relative overflow-hidden bg-black py-20 sm:py-28">
      <div aria-hidden className="pointer-events-none absolute inset-0 glow-center" />
      <div className="container-x relative text-center">
        <p className="label mb-5">The shop</p>
        <h2
          className="mx-auto max-w-[20ch] text-white"
          style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: "clamp(32px, 5.6vw, 72px)",
            lineHeight: 1.06,
            letterSpacing: "-0.012em",
          }}
        >
          Crafting <span className="italic text-white/70">heirlooms</span> for moments that deserve to shine.
        </h2>
        <p className="mx-auto mt-6 max-w-[42ch] text-[13.5px] leading-relaxed text-white/50">
          A family counter in Jagdamba Market. Choose a piece, watch it weighed, and see the day&apos;s
          rate on the same scale.
        </p>
      </div>
    </section>
  );
}

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("text-[10px] font-medium uppercase tracking-[0.26em] text-white/45 sm:text-[11px]", className)}>
      {children}
    </p>
  );
}
