import Link from "next/link";
import { IconChevron, IconGoldEmblem } from "@/components/icons/JmdIcons";
import { PLACEHOLDER, type ShopSettings } from "@/lib/settings";

export function ExchangeCard({ settings }: { settings: ShopSettings }) {
  return (
    <section className="bg-black px-4 pb-12 pt-2 sm:px-6">
      <div className="relative mx-auto max-w-[720px] pb-4">
        <div className="rounded-card border border-white/10 bg-white/[0.03] px-6 pb-9 pt-7 text-center shadow-card backdrop-blur-xl">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-white/15 bg-white/[0.05] text-[#E4C68F]">
            <IconGoldEmblem size={34} />
          </span>
          <p className="mx-auto mt-3 max-w-[44ch] font-serif text-[15px] leading-relaxed text-bodygrey">
            {settings.exchangeNote ?? `${PLACEHOLDER} — old gold exchange valuation and terms.`}
          </p>
          <Link
            href="/contact"
            className="mt-4 inline-flex min-h-10 items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#E4C68F] transition-colors hover:text-white"
          >
            Know more <IconChevron size={13} />
          </Link>
        </div>
        {/* Hanging tab */}
        <span
          aria-hidden
          className="absolute bottom-0 left-1/2 h-5 w-[46%] -translate-x-1/2 rounded-b-[18px] border-x border-b border-white/10 bg-white/[0.03]"
        />
      </div>
    </section>
  );
}
