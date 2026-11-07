"use client";

import { useState } from "react";
import Link from "next/link";
import { gemstones } from "@/lib/catalog";
import { useLang } from "@/components/providers/LangProvider";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";

/**
 * Gemstone index. The old version faked gem photography with radial gradients
 * and a blurred glow orb — both are gone. Until real stone photos exist this is
 * a typographic index, which is honest and loads instantly.
 *
 * [CONFIRM WITH SHOP] origin notes and the benefit lines are catalogue copy,
 * not verified gemmological claims.
 */
export function GemstoneGallery() {
  const { lang } = useLang();
  const [active, setActive] = useState(0);
  const gem = gemstones[active];

  return (
    <section className="section border-y border-navy/15 bg-black">
      <div className="container-x grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] lg:gap-16">
        <div>
          <SectionHeading
            kicker="Navratna"
            title={lang === "hi" ? "रत्न, नाम से" : "Stones we keep"}
            sub={
              lang === "hi"
                ? "हर रत्न के लिए वज़न, कट और प्रमाणपत्र की जानकारी काउंटर पर।"
                : "Nine stones, kept loose and set. Ask for the weight, cut and certificate of any piece."
            }
          />

          <ul className="grid grid-cols-2 border-t border-navy/15 sm:grid-cols-3">
            {gemstones.map((g, i) => (
              <li key={g.slug} className="border-b border-navy/15">
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  aria-pressed={active === i}
                  className={cn(
                    "flex min-h-11 w-full items-center gap-3 px-1 py-4 text-left text-16 transition-colors",
                    active === i ? "text-white" : "text-charcoal/75 hover:text-white",
                  )}
                >
                  <span
                    aria-hidden
                    className="h-2 w-2 shrink-0"
                    style={{ backgroundColor: active === i ? "#C98B6B" : "transparent", border: "1px solid #C98B6B" }}
                  />
                  <span className={cn("font-serif", active === i && "italic")}>
                    {lang === "hi" ? g.nameHi : g.name}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <aside className="border-t border-navy/15 pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
          <p className="label">{lang === "hi" ? "चुना हुआ रत्न" : "Selected stone"}</p>
          <h3 className="mt-3 text-28 text-white">{lang === "hi" ? gem.nameHi : gem.name}</h3>
          <p className="mt-3 font-hindi text-14 text-stone">{lang === "hi" ? gem.benefitHi : gem.benefit}</p>
          <p className="mt-3 text-12 uppercase tracking-label text-copper-dark">{gem.originNote}</p>
          <Link
            href={`/collections/gemstones?gemstone=${gem.slug}`}
            className="mt-6 inline-flex min-h-11 items-center border-b border-copper/40 text-12 uppercase tracking-label text-copper-dark hover:border-navy hover:text-white"
          >
            Pieces with {gem.name}
          </Link>
        </aside>
      </div>
    </section>
  );
}
