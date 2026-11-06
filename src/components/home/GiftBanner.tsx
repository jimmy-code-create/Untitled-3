import Link from "next/link";
import { IconChevron } from "@/components/icons/JmdIcons";
import { PLACEHOLDER, type ShopSettings } from "@/lib/settings";

export function GiftBanner({ settings }: { settings: ShopSettings }) {
  return (
    <section className="bg-cream px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-content">
        <div className="relative overflow-hidden rounded-[32px] bg-blush py-9 pl-12 pr-6 sm:pl-16 sm:pr-10">
          {/* Ribbon: vertical + bottom edge, bow at the crossing */}
          <span aria-hidden className="absolute inset-y-0 left-5 w-3 bg-burgundy sm:left-8" />
          <span aria-hidden className="absolute inset-x-0 bottom-0 h-3 bg-burgundy" />
          <span aria-hidden className="absolute bottom-1 left-2 h-5 w-5 rotate-[-24deg] rounded-[60%_40%_60%_40%] border-[3px] border-burgundy sm:left-5" />
          <span aria-hidden className="absolute bottom-1 left-7 h-5 w-5 rotate-[24deg] rounded-[40%_60%_40%_60%] border-[3px] border-burgundy sm:left-10" />
          <span aria-hidden className="absolute bottom-2 left-[26px] h-2.5 w-2.5 rounded-full bg-burgundy sm:left-[42px]" />

          <div className="relative">
            <h2 className="font-serif text-28 font-semibold leading-[1.05] text-burgundy sm:text-34">
              #GiftOfChoice
            </h2>
            <p className="mt-2 max-w-[34ch] text-[13px] leading-relaxed text-bodygrey">
              A little something for the people you love.
            </p>
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-burgundy">
              Starting at {settings.giftStartingPrice ?? PLACEHOLDER}
            </p>
            <Link
              href="/collections/gifting"
              className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-control border border-burgundy/50 px-5 text-[10px] font-semibold uppercase tracking-[0.12em] text-burgundy transition-colors hover:bg-burgundy hover:text-white"
            >
              Explore now <IconChevron size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
