"use client";

import Link from "next/link";
import { occasions } from "@/lib/catalog";
import { useLang } from "@/components/providers/LangProvider";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ImageSlot } from "@/components/ui/ImageSlot";

/**
 * Occasions: rectangular slots with captions. The old circular avatars read as
 * a social-media row rather than a jewellery counter, so they are gone.
 */
export function Occasions() {
  const { lang } = useLang();

  return (
    <section className="section bg-lilacsoft">
      <div className="container-x">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:items-end lg:gap-12">
          <SectionHeading
            kicker="By occasion"
            title={lang === "hi" ? "किस मौके के लिए?" : "What is the occasion?"}
            sub={
              lang === "hi"
                ? "शादी, करवा चौथ, दिवाली — बताइए, हम वही दिखाएंगे।"
                : "Tell us the day and we will keep the trays ready before you arrive."
            }
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 lg:gap-5">
            {occasions.map((o, i) => (
              <Reveal key={o.slug} delay={i * 0.04}>
                <Link href={`/collections/all?occasion=${o.slug}`} className="group block">
                  <ImageSlot
                    src={o.image}
                    alt={`${o.name} jewellery`}
                    ratio="collection"
                    sizes="(max-width: 640px) 45vw, 18vw"
                    imageClassName="transition-transform duration-300 ease-out group-hover:scale-[1.04]"
                  />
                  <p className="mt-2 text-12 uppercase tracking-label text-charcoal/75 group-hover:text-copper-dark">
                    {lang === "hi" ? o.nameHi : o.name}
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
