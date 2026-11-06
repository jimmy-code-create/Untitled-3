import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * Full-bleed navy band: one big serif line, one quiet action.
 * This is the section that breaks the rhythm between image-led blocks, so it
 * carries no photos, no cards and no icons.
 */
export function EditorialBand() {
  return (
    <section className="bg-navy py-14 lg:py-24">
      <div className="container-x">
        <p className="label-light">At the counter</p>
        <p className="mt-5 max-w-[22ch] font-serif text-28 leading-[1.15] text-ivory sm:text-44 lg:text-72 lg:leading-[1.02]">
          You see the weight. You see the rate. Then you decide.
        </p>
        <div className="mt-8 flex flex-col gap-4 border-t border-ivory/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="measure text-14 text-ivory/55">
            No printed card with a made-up price. Our pieces are priced from the metal weight, the stone and the
            making charge, and we will walk you through each line.
          </p>
          <Link
            href="/visit"
            className="inline-flex min-h-11 shrink-0 items-center gap-2 text-12 uppercase tracking-label text-copper-light hover:text-ivory"
          >
            Visit the shop
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
