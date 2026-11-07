import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * The ring wall: every tile is one of the shop's own ring photographs, laid on a
 * porcelain panel the way a tray of rings would sit on the counter.
 */
const RINGS = [
  "crown-solitaire-gold",
  "emerald-halo-silver",
  "blossom-spray-rose",
  "baguette-solitaire-silver",
  "ruby-heart-gold",
  "emerald-ring-gold",
  "crown-solitaire-rose",
  "snowflake-cluster-silver",
  "twist-infinity-rose",
  "butterfly-kiss-gold",
  "lotus-six-silver",
  "stone-cluster-rose",
  "leaf-engraved-gold",
  "starlight-silver",
  "twin-heart-gold",
  "crystal-lattice-rose",
  "infinity-knot-gold",
  "filigree-swirl-silver",
];

export function RingWall() {
  return (
    <section className="relative overflow-hidden bg-black pb-20 sm:pb-28">
      <div className="container-x">
        <div className="mx-auto max-w-[620px] text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.26em] text-white/40 sm:text-[11px]">
            The JMD collection
          </p>
          <h2
            className="mt-4 text-white"
            style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontSize: "clamp(32px, 5.4vw, 66px)",
              lineHeight: 1.04,
            }}
          >
            Rings by <span className="italic text-white/70">JMD Gems &amp; Jewellery</span>
          </h2>
        </div>

        <div className="mt-8 rounded-[28px] border border-white/10 bg-[#F3EFE7] p-2.5 sm:mt-10 sm:rounded-[34px] sm:p-4">
          <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 sm:gap-2 lg:grid-cols-6">
            {RINGS.map((slug, index) => (
              <Link
                key={slug}
                href="/collections/rings"
                aria-label="See the ring collection"
                className="group relative aspect-square overflow-hidden rounded-xl bg-[#FBF9F5] transition-colors duration-300 hover:bg-white sm:rounded-2xl"
              >
                <Image
                  src={`/images/rings/${slug}.webp`}
                  alt=""
                  fill
                  loading={index < 6 ? "eager" : "lazy"}
                  sizes="(max-width: 640px) 30vw, (max-width: 1024px) 22vw, 15vw"
                  className="scale-[1.28] object-contain transition-transform duration-500 ease-out group-hover:scale-[1.4]"
                />
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-7 flex justify-center">
          <Link
            href="/collections/rings"
            className="liquid-glass inline-flex min-h-11 items-center gap-2 rounded-full px-6 py-3 text-[11px] font-medium uppercase tracking-[0.16em] text-white/85 transition-colors hover:text-white"
          >
            View all rings
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
