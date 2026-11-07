import Image from "next/image";
import Link from "next/link";
import { IconArrowRight } from "@/components/icons/JmdIcons";

export function CollectionsFeature() {
  return (
    <section className="section relative overflow-hidden bg-black">
      <div aria-hidden className="pointer-events-none absolute inset-0 glow-top" />

      <div className="container-x relative">
        <div className="mx-auto max-w-[620px] text-center">
          <p className="label mb-4">The collection</p>
          <h2
            className="text-white"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(34px, 5vw, 64px)", lineHeight: 1.05 }}
          >
            JMD <span className="italic text-[#E4C68F]/85">Collections</span>
          </h2>
          <p className="mx-auto mt-3 max-w-[42ch] text-[13.5px] leading-relaxed text-white/55">
            Explore our newly launched collection — stones set by hand, photographed exactly as they leave the counter.
          </p>
        </div>

        <Link
          href="/collections/gemstones"
          className="group mx-auto mt-10 block max-w-[720px] overflow-hidden rounded-[28px] border border-white/10"
        >
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#0d1412] sm:aspect-[16/11]">
            <Image
              src="/images/emerald-pendant.webp"
              alt="Emerald pendant on a deep green backdrop"
              fill
              sizes="(max-width: 640px) 100vw, 720px"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-7">
              <div className="liquid-glass rounded-2xl px-5 py-4 text-left">
                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#E4C68F]">Newly launched</p>
                <h3
                  className="mt-1 text-white"
                  style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "28px", lineHeight: 1.1 }}
                >
                  Emerald &amp; Gemstone
                </h3>
              </div>

              <span className="inline-flex items-center gap-2 self-start rounded-full bg-white px-5 py-3 text-[11px] font-medium uppercase tracking-[0.12em] text-black transition-transform duration-300 group-hover:gap-3">
                View collection
                <IconArrowRight size={15} />
              </span>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
