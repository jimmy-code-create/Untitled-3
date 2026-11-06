import Image from "next/image";
import Link from "next/link";
import { IconArrowRight } from "@/components/icons/JmdIcons";

export function CollectionsFeature() {
  return (
    <section className="section bg-cream">
      <div className="container-x">
        <div className="mx-auto max-w-[560px] text-center">
          <h2 className="text-28 sm:text-34">JMD Collections</h2>
          <p className="mt-2 text-14 text-bodygrey">Explore our newly launched collection</p>
        </div>

        <Link
          href="/collections/gemstones"
          className="group mx-auto mt-6 block max-w-[560px] overflow-hidden rounded-card"
        >
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-card bg-[#123B3B]">
            <Image
              src="/images/emerald-pendant.webp"
              alt="Emerald pendant on a deep green backdrop"
              fill
              sizes="(max-width: 640px) 100vw, 560px"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#123B3B]/90 via-[#123B3B]/20 to-transparent px-6 pb-6 pt-16">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gold-light">
                Newly launched
              </p>
              <h3 className="mt-1 font-serif text-28 font-semibold text-white">Emerald &amp; Gemstone</h3>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between px-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-burgundy">
              View collection
            </span>
            <IconArrowRight size={16} className="text-burgundy transition-transform group-hover:translate-x-1" />
          </div>
        </Link>
      </div>
    </section>
  );
}
