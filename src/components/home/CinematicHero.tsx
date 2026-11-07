"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PrivateListForm } from "./PrivateListForm";
import { SHOP, cn, waLink } from "@/lib/utils";

/**
 * Cinematic hero.
 *
 * A live loop cut from the shop's own photography (a portrait and a landscape
 * encode, chosen by <source media>) with a poster frame behind it, so the first
 * paint is instant and never waits on video. The loop fades through black at
 * every join, which also hides the seam where it restarts.
 *
 * Reduced motion gets the poster still instead of the video.
 */

const SERIF = { fontFamily: "'Instrument Serif', Georgia, serif" } as const;

export function CinematicHero() {
  const [mounted, setMounted] = useState(false);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setMounted(true));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    setStill(reduced.matches);

    const onChange = (event: MediaQueryListEvent) => setStill(event.matches);
    reduced.addEventListener("change", onChange);
    return () => {
      window.cancelAnimationFrame(id);
      reduced.removeEventListener("change", onChange);
    };
  }, []);

  return (
    <section
      aria-label={`${SHOP.name} — at the counter`}
      className="relative isolate flex min-h-[calc(100svh-218px)] w-full flex-col overflow-hidden bg-black text-white"
    >
      {/* Film plane */}
      <div aria-hidden className="absolute inset-0 z-0">
        {still ? (
          <Image
            src="/images/hero-poster.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        ) : (
          <video
            className="h-full w-full object-cover object-center"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/images/hero-poster.webp"
          >
            <source src="/videos/hero-portrait.mp4" type="video/mp4" media="(max-width: 767px)" />
            <source src="/videos/hero-landscape.mp4" type="video/mp4" />
          </video>
        )}
      </div>

      {/* Legibility: a soft floor, a ceiling and a centre vignette. */}
      <div aria-hidden className="absolute inset-0 z-10 bg-gradient-to-b from-black/75 via-black/25 to-black/90" />
      <div
        aria-hidden
        className="absolute inset-0 z-10 bg-[radial-gradient(120%_85%_at_50%_42%,rgba(0,0,0,0.05)_0%,rgba(0,0,0,0.5)_72%,rgba(0,0,0,0.9)_100%)]"
      />

      {/* Content */}
      <div
        className={cn(
          "relative z-20 flex flex-1 flex-col items-center justify-center gap-5 px-5 py-14 text-center transition-all duration-1000 ease-out sm:gap-6 sm:px-8 sm:py-20",
          mounted ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0",
        )}
      >
        <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-white/60 sm:text-[11px]">
          JMD Gems &amp; Jewellery
        </p>

        <h1
          style={{ ...SERIF, fontSize: "clamp(52px, 12vw, 118px)", lineHeight: 0.95, letterSpacing: "-0.015em" }}
          className="max-w-[16ch] text-white"
        >
          Worn for <span className="italic text-white/85">ever</span>
        </h1>

        <PrivateListForm />

        <p className="max-w-[46ch] text-[13px] leading-relaxed text-white/75 sm:text-[14.5px]">
          22K and 18K gold, diamonds, gemstones and 92.5 silver — weighed and priced in front of
          you at Jagdamba Market, Hindaun.
        </p>

        <div className="mt-1 flex flex-col items-center gap-3 sm:flex-row sm:gap-3">
          <Link
            href="/about"
            className="liquid-glass inline-flex min-h-11 items-center justify-center rounded-full px-7 py-3 text-[12.5px] font-medium text-white transition duration-200 hover:bg-white/[0.09] sm:text-[13px]"
          >
            Our story
          </Link>

          <a
            href={waLink(`Namaste ${SHOP.name}. I would like to see some pieces at the counter.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-5 py-3 text-[11px] font-medium uppercase tracking-[0.16em] text-white/70 transition-colors hover:text-white"
          >
            WhatsApp
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
          </a>
        </div>
      </div>

      {/* Foot rail: place and the shop's two numbers. */}
      <div className="relative z-20 flex items-center justify-between gap-4 px-5 pb-5 text-[9.5px] font-medium uppercase tracking-[0.16em] text-white/45 sm:px-8 sm:pb-6 sm:text-[10px]">
        <span>Jagdamba Market · Hindaun</span>
        <span className="hidden sm:inline">78913 84376 · 63774 19074</span>
      </div>
    </section>
  );
}
