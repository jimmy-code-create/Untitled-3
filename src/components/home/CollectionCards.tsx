import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

/**
 * Image-topped glass cards: the reference's collection rhythm — photograph on
 * top, a quiet kicker with a circular arrow, then the name and one honest line.
 */
const CARDS = [
  {
    kicker: "Bridal",
    title: "Engagement & Wedding",
    copy: "Solitaires, halos and matching bands, chosen with your family at the counter.",
    href: "/collections/bridal",
    image: "/images/bridal-hands.webp",
    alt: "Bridal gold jewellery on hands",
  },
  {
    kicker: "Everyday",
    title: "Gold & Silver Chains",
    copy: "Light chains, bangles and studs for every day — 22K, 18K and 92.5 silver.",
    href: "/collections/gold",
    image: "/images/gold-chain-necklace.webp",
    alt: "Gold chain necklace",
  },
  {
    kicker: "Diamond",
    title: "Diamond & Solitaire",
    copy: "Rings, pendants and studs set with certified stones, priced on the day.",
    href: "/collections/diamond",
    image: "/images/diamond-rings.webp",
    alt: "Diamond rings",
  },
  {
    kicker: "Bespoke",
    title: "Custom Design",
    copy: "Tell us the stone and the size. We will make it in the workshop and show you the weight.",
    href: "/contact",
    image: "/images/emerald-pendant.webp",
    alt: "Emerald pendant on a dark backdrop",
  },
];

export function CollectionCards() {
  return (
    <section className="section relative overflow-hidden bg-black">
      <div className="container-x">
        <div className="mx-auto max-w-[560px] text-center">
          <p className="label mb-4">The collection</p>
          <h2
            className="text-white"
            style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontSize: "clamp(34px, 5.4vw, 68px)",
              lineHeight: 1.04,
            }}
          >
            Find your <span className="italic text-[#E4C68F]/85">piece</span>
          </h2>
        </div>

        <div className="mt-10 grid gap-4 sm:mt-14 sm:gap-5 lg:grid-cols-2">
          {CARDS.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="liquid-glass group overflow-hidden rounded-[26px] transition-colors duration-300 hover:border-white/25"
            >
              <div className="relative aspect-[16/11] w-full overflow-hidden">
                <Image
                  src={card.image}
                  alt={card.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]"
                />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
              </div>

              <div className="relative p-5 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-white/45">
                    {card.kicker}
                  </p>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/25 text-white/80 transition duration-300 group-hover:border-white group-hover:bg-white group-hover:text-black">
                    <ArrowUpRight className="h-4 w-4" strokeWidth={1.6} aria-hidden />
                  </span>
                </div>

                <h3 className="mt-3 text-[22px] font-medium leading-tight tracking-[-0.01em] text-white sm:text-[26px]">
                  {card.title}
                </h3>
                <p className="mt-2 max-w-[42ch] text-[13px] leading-relaxed text-white/50 sm:text-[13.5px]">
                  {card.copy}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
