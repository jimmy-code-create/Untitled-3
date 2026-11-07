"use client";

import { useRef } from "react";
import Link from "next/link";
import { IconArrowLeft, IconArrowRight } from "@/components/icons/JmdIcons";
import { ProductCard } from "@/components/product/ProductCard";
import { SectionHeading } from "@/components/ui/Reveal";
import { useLang } from "@/components/providers/LangProvider";
import type { ProductView } from "@/lib/repo";

export function Trending({ items }: { items: ProductView[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const { t, isHi } = useLang();

  const scroll = (dir: -1 | 1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <section className="bg-black py-16 sm:py-24">
      <div className="container-x">
        <SectionHeading
          kicker={isHi ? "सबसे ज़्यादा पसंद किए गए" : "Most loved this month"}
          title={t("home.trending")}
          align="left"
          action={
            <div className="flex items-center gap-2">
              <button
                onClick={() => scroll(-1)}
                aria-label="Previous"
                className="grid h-11 w-11 place-items-center border border-copper/50 text-copper-dark transition-colors hover:bg-copper hover:text-white"
              >
                <IconArrowLeft size={16} aria-hidden />
              </button>
              <button
                onClick={() => scroll(1)}
                aria-label="Next"
                className="grid h-11 w-11 place-items-center border border-copper/50 text-copper-dark transition-colors hover:bg-copper hover:text-white"
              >
                <IconArrowRight size={16} aria-hidden />
              </button>
              <Link
                href="/collections/all"
                className="ml-3 hidden text-[10px] uppercase tracking-widest2 text-copper-dark underline decoration-copper/40 underline-offset-4 sm:block"
              >
                {t("home.viewAll")}
              </Link>
            </div>
          }
        />
        <div
          ref={scroller}
          className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:px-8"
        >
          {items.map((p) => (
            <div key={p.slug} className="w-[230px] shrink-0 snap-start sm:w-[290px]">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
