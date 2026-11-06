"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  IconBag,
  IconChevron,
  IconClose,
  IconSparkle,
  IconUser,
} from "@/components/icons/JmdIcons";
import type { ShopSettings } from "@/lib/settings";

const ROWS = [
  { label: "All Jewellery", href: "/collections/all" },
  { label: "Gold", href: "/collections/gold" },
  { label: "Silver", href: "/collections/silver" },
  { label: "Gemstones", href: "/collections/gemstones" },
  { label: "Earrings", href: "/collections/all?category=earrings" },
  { label: "Daily Wear", href: "/collections/all?occasion=daily" },
  { label: "Festive Picks", href: "/collections/all?occasion=festive", festive: true },
  { label: "Wedding", href: "/collections/bridal" },
  { label: "Gifting", href: "/collections/gifting" },
  { label: "Under ₹50K", href: "/collections/all?maxPrice=50000" },
  { label: "More", href: "/collections/all" },
];

export function MenuDrawer({
  open,
  onClose,
  settings,
}: {
  open: boolean;
  onClose: () => void;
  settings: ShopSettings;
}) {
  const { data: session } = useSession();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label="Menu">
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className="absolute inset-0 bg-burgundy-dark/35"
      />
      <div className="absolute inset-y-0 left-0 flex w-full max-w-[420px] animate-drawer-in flex-col overflow-y-auto bg-white px-4 pb-8 pt-3 shadow-popup">
        <div className="flex items-center justify-between">
          <Link
            href={session ? "/account" : "/login"}
            onClick={onClose}
            aria-label={session ? "Your account" : "Login or sign up"}
            className="grid h-11 w-11 place-items-center rounded-full text-burgundy"
          >
            <IconUser size={22} />
          </Link>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="grid h-11 w-11 place-items-center rounded-full bg-blush text-burgundy"
          >
            <IconClose size={20} />
          </button>
        </div>

        {/* Coupon card */}
        <div className="relative mt-5 overflow-hidden rounded-[18px] border border-burgundy/15 bg-blush px-4 py-4">
          <span aria-hidden className="absolute -left-2.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white" />
          <span aria-hidden className="absolute -right-2.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white" />
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white/70 text-burgundy">
              <IconBag size={26} />
            </span>
            <span aria-hidden className="h-14 border-l border-dashed border-burgundy/30" />
            <div className="min-w-0">
              <p className="truncate font-serif text-[19px] font-semibold leading-tight text-burgundy">
                {settings.offerHeadline}
              </p>
              <p className="mt-0.5 text-[11px] text-bodygrey">{settings.offerSub}</p>
              <Link
                href={session ? "/account" : "/login"}
                onClick={onClose}
                className="mt-1.5 inline-flex min-h-8 items-center text-[10px] font-semibold uppercase tracking-[0.12em] text-burgundy underline underline-offset-4"
              >
                Login | Sign up
              </Link>
            </div>
          </div>
        </div>

        <nav className="mt-4" aria-label="Shop collections">
          {ROWS.map((row) =>
            row.festive ? (
              <Link
                key={row.label}
                href={row.href}
                onClick={onClose}
                className="my-2 flex min-h-12 items-center gap-3 rounded-control bg-burgundy px-4 text-cream"
              >
                <IconSparkle size={17} className="text-gold-light" />
                <span className="flex-1 text-[13px] font-medium">{row.label}</span>
                <span className="rounded-control bg-gold-light px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-burgundy-dark">
                  New
                </span>
                <IconChevron size={15} className="text-cream/70" />
              </Link>
            ) : (
              <Link
                key={row.label}
                href={row.href}
                onClick={onClose}
                className="flex min-h-12 items-center gap-3 border-b border-burgundy/10 px-1 text-ink last:border-0"
              >
                <span className="h-1.5 w-1.5 rotate-45 rounded-[1px] bg-gold/70" aria-hidden />
                <span className="flex-1 text-[13px]">{row.label}</span>
                <IconChevron size={15} className="text-bodygrey/60" />
              </Link>
            ),
          )}
        </nav>

        <div className="mt-auto pt-6">
          <div className="inline-flex rounded-control border border-burgundy/15 p-0.5">
            <span className="rounded-control bg-burgundy px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-cream">
              INR
            </span>
          </div>
          <p className="mt-2 text-[10px] text-bodygrey/70">
            Prices are billed in Indian Rupees. USD display is not enabled.
          </p>
        </div>
      </div>
    </div>
  );
}
