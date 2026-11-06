import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const CARDS = [
  {
    name: "Wedding",
    href: "/collections/bridal",
    image: "/images/bridal-hands.webp",
    alt: "Bridal gold jewellery",
    ratio: "aspect-[3/4.2]",
  },
  {
    name: "Diamond",
    href: "/collections/diamond",
    image: "/images/diamond-rings.webp",
    alt: "Diamond rings",
    ratio: "aspect-square lg:aspect-[1/1.1]",
  },
  {
    name: "Gold",
    href: "/collections/gold",
    image: "/images/gold-chain-necklace.webp",
    alt: "Gold chain necklace",
    ratio: "aspect-square lg:aspect-[1/1.1]",
  },
  {
    name: "Daily Wear",
    href: "/collections/all?occasion=daily",
    image: "/images/model-thin-chain.webp",
    alt: "Light daily-wear chain",
    ratio: "aspect-[3/4.2]",
  },
];

export function WorldOfJmd() {
  return (
    <section className="section bg-blush/45">
      <div className="container-x">
        <div className="mx-auto max-w-[520px] text-center">
          <h2 className="text-28 sm:text-34">JMD World</h2>
          <p className="mt-2 text-14 text-bodygrey">A companion for every occasion</p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-3">
          {CARDS.map((card) => (
            <Link
              key={card.name}
              href={card.href}
              className={cn(
                "group relative block w-full overflow-hidden rounded-photo bg-burgundy-dark",
                card.ratio,
              )}
            >
              <Image
                src={card.image}
                alt={card.alt}
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              />
              <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-burgundy-dark/95 via-burgundy-dark/45 to-transparent" />
              <p className="absolute inset-x-2 bottom-3 text-center font-serif text-20 font-semibold text-white drop-shadow-sm">
                {card.name}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
