"use client";

import Link from "next/link";
import { collections } from "@/lib/catalog";
import { useLang } from "@/components/providers/LangProvider";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { cn } from "@/lib/utils";

/**
 * Asymmetric collection block: narrow text column, wide image grid where the
 * first piece is deliberately taller. Corners are 0px, images are 3:4.
 */
export function CollectionsGrid() {
  const { lang } = useLang();
  const [lead, ...rest] = collections;

  return (
    <section className="section bg-black">
      <div className="container-x grid gap-10 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)] lg:gap-14">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHeading
            kicker="Four counters"
            title={lang === "hi" ? "आप क्या ढूंढ रहे हैं?" : "What are you looking for?"}
            sub={
              lang === "hi"
                ? "सोना, हीरा, रत्न और ब्राइडल — चार अलग काउंटर, एक ही दुकान।"
                : "Gold, diamond, gemstone and bridal sit at four separate counters. Tell us the occasion and we will take you to the right one."
            }
          />
          <Link
            href="/collections/all"
            className="inline-flex min-h-11 items-center gap-2 border-b border-copper/40 text-12 uppercase tracking-label text-copper-dark hover:border-navy hover:text-white"
          >
            All {collections.length} collections
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3">
          <Reveal className="col-span-2 lg:col-span-1 lg:row-span-2">
            <Link href={`/collections/${lead.slug}`} className="group block">
              <ImageSlot
                src={lead.image}
                alt={`${lead.name} jewellery at JMD Gems & Jewellery`}
                ratio="collection"
                sizes="(max-width: 1024px) 100vw, 33vw"
                className={cn("lg:aspect-[3/4.6]")}
                imageClassName="transition-transform duration-300 ease-out group-hover:scale-[1.04]"
              />
              <div className="mt-3 flex items-baseline justify-between gap-3">
                <h3 className="text-20 text-white">{lang === "hi" ? lead.nameHi : lead.name}</h3>
                <span className="text-12 uppercase tracking-label text-stone">{lead.kicker}</span>
              </div>
            </Link>
          </Reveal>

          {rest.map((c, i) => (
            <Reveal key={c.slug} delay={0.05 * (i + 1)}>
              <Link href={`/collections/${c.slug}`} className="group block">
                <ImageSlot
                  src={c.image}
                  alt={`${c.name} jewellery at JMD Gems & Jewellery`}
                  ratio="collection"
                  sizes="(max-width: 1024px) 50vw, 22vw"
                  imageClassName="transition-transform duration-300 ease-out group-hover:scale-[1.04]"
                />
                <div className="mt-3">
                  <h3 className="text-20 text-white">{lang === "hi" ? c.nameHi : c.name}</h3>
                  <p className="mt-1 text-12 uppercase tracking-label text-stone">{c.kicker}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
