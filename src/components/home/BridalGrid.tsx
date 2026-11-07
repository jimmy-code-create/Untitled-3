"use client";

import Link from "next/link";
import { inr } from "@/lib/pricing";
import { useLang } from "@/components/providers/LangProvider";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ImageSlot } from "@/components/ui/ImageSlot";
import type { ProductView } from "@/lib/repo";

/**
 * Bridal: a static three-up. The previous build pinned the section and scrubbed
 * a horizontal track with GSAP, which fought the scroll on cheap Android
 * phones. Vertical, scannable, no library.
 */
export function BridalGrid({ items }: { items: ProductView[] }) {
  const { lang } = useLang();

  return (
    <section className="section bg-black">
      <div className="container-x">
        <SectionHeading
          kicker="Bridal"
          title={lang === "hi" ? "दुल्हन के सेट" : "Bridal sets"}
          sub={
            lang === "hi"
              ? "पूरा सेट एक साथ देखिए — हार, कान और हाथ। समय लगे तो लगे।"
              : "Ask to see the full set together — necklace, ears and hands. We will lay it out on the tray."
          }
          action={
            <Link
              href="/collections/bridal"
              className="inline-flex min-h-11 items-center border-b border-copper/40 text-12 uppercase tracking-label text-copper-dark hover:border-navy hover:text-white"
            >
              All bridal pieces
            </Link>
          }
        />

        <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, 3).map((p) => (
            <Link key={p.slug} href={`/products/${p.slug}`} className="group block">
              <ImageSlot
                src={p.images[0]}
                alt={`${p.name} — ${p.purity} ${p.metal.toLowerCase()}, ${p.weight} grams`}
                ratio="product"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                imageClassName="transition-transform duration-300 ease-out group-hover:scale-[1.04]"
              />
              <div className="mt-3 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-20 text-white">{p.name}</h3>
                  <p className="mt-1 text-12 uppercase tracking-label text-stone">
                    {p.purity} {p.metal === "SILVER" ? "silver" : p.metal.toLowerCase()} · {p.weight} g
                    {p.gemstoneSlug && p.gemstoneSlug !== "diamond" ? ` · ${p.gemstoneSlug.replace("-", " ")}` : ""}
                  </p>
                </div>
                <p className="shrink-0 text-16 text-white">{inr(p.price)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
