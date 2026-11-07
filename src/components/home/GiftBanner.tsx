import Link from "next/link";
import { IconChevron } from "@/components/icons/JmdIcons";
import { PLACEHOLDER, type ShopSettings } from "@/lib/settings";

export function GiftBanner({ settings }: { settings: ShopSettings }) {
  return (
    <section className="bg-black px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-content">
        <div className="liquid-glass relative overflow-hidden rounded-[28px] px-7 py-10 sm:px-12 sm:py-14">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(228,198,143,0.18),transparent_70%)]"
          />

          <div className="relative max-w-[46ch]">
            <p className="label mb-4">Gifting</p>
            <h2
              className="text-white"
              style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(34px, 5vw, 60px)", lineHeight: 1.02 }}
            >
              #Gift<span className="italic text-[#E4C68F]/85">OfChoice</span>
            </h2>
            <p className="mt-3 text-[13.5px] leading-relaxed text-white/55">
              A little something for the people you love. Pick a piece, we wrap it and hand it over the counter.
            </p>
            <p className="mt-4 text-[10px] font-medium uppercase tracking-[0.16em] text-[#E4C68F]">
              Starting at {settings.giftStartingPrice ?? PLACEHOLDER}
            </p>
            <Link
              href="/collections/gifting"
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/25 px-6 text-[11px] font-medium uppercase tracking-[0.12em] text-white transition-colors hover:border-white/50 hover:bg-white/10"
            >
              Explore now <IconChevron size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
