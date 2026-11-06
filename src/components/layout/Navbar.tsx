"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { AnnouncementBar } from "./AnnouncementBar";
import { MenuDrawer } from "./MenuDrawer";
import { SearchBar } from "./SearchBar";
import { RateTicker } from "./RateTicker";
import { cartCount, useCart, useWishlist } from "@/store/cart";
import { IconBag, IconHeart, IconMenu, IconSearch, IconStore } from "@/components/icons/JmdIcons";
import type { RateMap } from "@/lib/pricing";
import type { ShopSettings } from "@/lib/settings";

const NAV = [
  { label: "All Jewellery", href: "/collections/all" },
  { label: "Gold", href: "/collections/gold" },
  { label: "Silver", href: "/collections/silver" },
  { label: "Gemstones", href: "/collections/gemstones" },
  { label: "Bridal", href: "/collections/bridal" },
  { label: "Gifting", href: "/collections/gifting" },
];

const iconButton =
  "relative grid h-11 w-11 place-items-center rounded-full text-burgundy transition-colors hover:bg-blush/70";

export function Navbar({
  rates,
  rateUpdatedAt,
  staleLabel,
  settings,
}: {
  rates: RateMap;
  rateUpdatedAt?: string;
  staleLabel?: string | null;
  settings: ShopSettings;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const lines = useCart((s) => s.lines);
  const wish = useWishlist((s) => s.items);

  useEffect(() => setMounted(true), []);

  const focusSearch = () => {
    const input = document.getElementById("jmd-search") as HTMLInputElement | null;
    input?.scrollIntoView({ block: "center", behavior: "smooth" });
    input?.focus({ preventScroll: true });
  };

  return (
    <>
      <div className="relative z-50 bg-white">
        <AnnouncementBar text={settings.announcementText} />

        <header className="border-b border-burgundy/10 bg-white">
          <div className="container-x">
            <div className="relative flex h-16 items-center justify-between">
              {/* Left: hamburger + logo */}
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => setMenuOpen(true)}
                  aria-label="Open menu"
                  aria-expanded={menuOpen}
                  className={iconButton}
                >
                  <IconMenu size={24} />
                </button>
                <Link href="/" aria-label="JMD Gems & Jewellery — home" className="ml-0.5">
                  <span className="lg:hidden">
                    <Logo size="sm" />
                  </span>
                  <span className="hidden lg:block">
                    <Logo size="md" />
                  </span>
                </Link>
              </div>

              {/* Desktop logo, centred */}
              <Link
                href="/"
                aria-label="JMD Gems & Jewellery — home"
                className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:block"
              >
                <Logo size="md" />
              </Link>

              {/* Right: icons */}
              <div className="flex items-center">
                <button type="button" onClick={focusSearch} aria-label="Search" className={iconButton}>
                  <IconSearch size={22} />
                </button>
                <Link href="/visit" aria-label="Visit the shop" className={`${iconButton} hidden sm:grid`}>
                  <IconStore size={22} />
                </Link>
                <Link href="/wishlist" aria-label="Wishlist" className={`${iconButton} hidden sm:grid`}>
                  <IconHeart size={22} />
                  {mounted && wish.length > 0 ? (
                    <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-gold" aria-hidden />
                  ) : null}
                </Link>
                <Link href="/cart" aria-label="Bag" className={iconButton}>
                  <IconBag size={22} />
                  {mounted && lines.length > 0 ? (
                    <span className="absolute right-0.5 top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-burgundy px-1 text-[10px] font-semibold leading-none text-white">
                      {cartCount(lines)}
                    </span>
                  ) : null}
                </Link>
              </div>
            </div>
          </div>

          {/* Desktop nav row */}
          <nav aria-label="Collections" className="hidden border-t border-burgundy/10 lg:block">
            <div className="container-x flex h-11 items-center justify-center gap-8">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink/80 transition-colors hover:text-burgundy"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/gold-rate"
                className="text-[11px] font-medium uppercase tracking-[0.12em] text-gold-dark transition-colors hover:text-burgundy"
              >
                Today&apos;s Rate
              </Link>
            </div>
          </nav>

          {/* Search + rate strip */}
          <SearchBar />
          <RateTicker
            initialRates={rates}
            initialUpdatedAt={rateUpdatedAt}
            initialStaleLabel={staleLabel}
          />
        </header>
      </div>

      <MenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} settings={settings} />
    </>
  );
}
