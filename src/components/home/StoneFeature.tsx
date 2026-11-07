import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

/**
 * "Gold × Light" — a full-width stone image with one display line above it and
 * the reference's eyebrow + paragraph + glass pill below.
 */
export function StoneFeature() {
  return (
    <section className="relative overflow-hidden bg-black py-16 sm:py-24">
      <div aria-hidden className="pointer-events-none absolute inset-0 glow-center" />

      <div className="container-x relative">
        <h2
          className="mx-auto max-w-[14ch] text-center text-white"
          style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: "clamp(44px, 9vw, 108px)",
            lineHeight: 0.98,
            letterSpacing: "-0.015em",
          }}
        >
          Gold <span className="italic text-[#E4C68F]/80">×</span> Light
        </h2>

        <div className="relative mx-auto mt-8 max-w-[980px] overflow-hidden rounded-[26px] border border-white/10 sm:mt-12 sm:rounded-[34px]">
          <div className="relative aspect-[4/5] w-full sm:aspect-[16/9]">
            <Image
              src="/images/emerald-pendant.webp"
              alt="Emerald pendant lit against a deep green backdrop"
              fill
              sizes="(max-width: 1024px) 100vw, 980px"
              className="object-cover"
            />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-7">
              <p className="max-w-[34ch] text-[12px] leading-relaxed text-white/70 sm:text-[13px]">
                Sapphire, ruby, emerald and diamond — set in gold or silver, chosen from what is in
                the case today.
              </p>
              <Link
                href="/collections/gemstones"
                className="liquid-glass inline-flex w-fit items-center gap-2 rounded-full px-5 py-3 text-[11px] font-medium uppercase tracking-[0.14em] text-white transition-colors hover:bg-white/[0.1]"
              >
                View collection
                <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden />
              </Link>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-9 max-w-[620px] text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.26em] text-white/40 sm:text-[11px]">
            Choose your stone
          </p>
          <p className="mt-4 text-[13.5px] leading-relaxed text-white/60 sm:text-[15px]">
            Every stone is shown loose before it is set, so you can see its colour and size in
            daylight — and know exactly what the piece will weigh.
          </p>
        </div>
      </div>
    </section>
  );
}
