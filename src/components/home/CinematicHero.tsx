"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ArrowUpRight, Lock } from "lucide-react";
import { useLiveRates } from "@/components/providers/LiveRatesProvider";
import { inr } from "@/lib/pricing";
import { SHOP, cn, waLink } from "@/lib/utils";

/**
 * Cinematic hero for the shop.
 *
 * Full-viewport photography, glass chrome and one display line — but laid out as
 * a flex column (rail, headline, actions) rather than absolutely positioned
 * blocks, so nothing collides on short phones.
 *
 * Motion: GSAP drives the pointer parallax (lerp 0.06) and the slow Ken Burns
 * push; entrances are CSS transitions so first paint is stable. Everything is
 * skipped for prefers-reduced-motion.
 */

const SLIDES = [
  { src: "/images/hero-necklace.webp", alt: "" },
  { src: "/images/bridal-hands.webp", alt: "" },
  { src: "/images/rings/infinity-knot-gold.webp", alt: "" },
  { src: "/images/emerald-pendant.webp", alt: "" },
  { src: "/images/gold-bracelet.webp", alt: "" },
];

const ROTATE_MS = 6500;

export function CinematicHero() {
  const stage = useRef<HTMLDivElement>(null);
  const layers = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [mounted, setMounted] = useState(false);
  const live = useLiveRates();

  const rate24 = live.rates["24K"];

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (paused) return;
    const timer = window.setInterval(() => setActive((i) => (i + 1) % SLIDES.length), ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [paused]);

  useEffect(() => {
    const onVisibility = () => setPaused(document.visibilityState === "hidden");
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const image = layers.current[active]?.querySelector("img");
    if (!image) return;
    const tween = gsap.fromTo(image, { scale: 1.04 }, { scale: 1.16, duration: ROTATE_MS / 1000 + 1.8, ease: "none" });
    return () => {
      tween.kill();
    };
  }, [active]);

  useEffect(() => {
    const plane = stage.current;
    if (!plane) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let frame = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const onMove = (event: MouseEvent) => {
      targetX = ((event.clientX - window.innerWidth / 2) / (window.innerWidth / 2)) * 20;
      targetY = ((event.clientY - window.innerHeight / 2) / (window.innerHeight / 2)) * 20;
    };

    const tick = () => {
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;
      gsap.set(plane, { x: currentX, y: currentY });
      frame = window.requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    frame = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section
      aria-label="JMD Gems & Jewellery — at the counter"
      className="relative isolate flex min-h-[100svh] w-full flex-col overflow-hidden bg-black text-white"
    >
      {/* Media plane — scaled 1.08 so the parallax never reveals an edge. */}
      <div
        ref={stage}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 origin-center scale-[1.08] will-change-transform"
      >
        {SLIDES.map((slide, index) => (
          <div
            key={slide.src}
            ref={(node) => {
              layers.current[index] = node;
            }}
            className={cn(
              "absolute inset-0 transition-opacity duration-[1600ms] ease-out",
              index === active ? "opacity-100" : "opacity-0",
            )}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover object-center"
            />
          </div>
        ))}
      </div>

      {/* Legibility: floor, ceiling and a soft vignette, never a flat scrim. */}
      <div aria-hidden className="absolute inset-0 z-10 bg-gradient-to-b from-black/80 via-black/35 to-black/90" />
      <div
        aria-hidden
        className="absolute inset-0 z-10 bg-[radial-gradient(120%_85%_at_50%_0%,transparent_28%,rgba(0,0,0,0.6)_100%)]"
      />

      {/* Rail: place, and the one number that changes every day. */}
      <div className="relative z-20 flex items-start justify-between gap-4 px-5 pt-7 sm:px-10 sm:pt-9">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/70 sm:text-[11px]">
          Jagdamba Market · Hindaun
        </p>

        <div className="liquid-glass max-w-[190px] rounded-full px-4 py-2 text-right">
          <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-white/60">Today · 24K</p>
          <p className="rate-digits text-[13px] font-medium leading-tight text-white">
            {typeof rate24 === "number" ? `${inr(rate24)}/g` : "Rate at counter"}
          </p>
          {live.staleLabel ? (
            <p className="text-[8.5px] uppercase tracking-[0.1em] text-white/50">{live.staleLabel}</p>
          ) : null}
        </div>
      </div>

      {/* Headline — the only display line on the page. */}
      <div className="relative z-20 flex flex-1 items-center justify-center px-5 py-10 text-center sm:px-8">
        <h1
          className={cn(
            "mx-auto max-w-[13ch] transition-all duration-1000 ease-out sm:max-w-none",
            mounted ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
          )}
          style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: "clamp(42px, 7.2vw, 96px)",
            lineHeight: 1.02,
            letterSpacing: "-0.01em",
            fontWeight: 400,
          }}
        >
          <span className="block text-white">Nothing hidden in the gold.</span>
          <span className="mt-1 block italic text-[#E4C68F]/80">Nothing rushed in the choosing.</span>
        </h1>
      </div>

      {/* Actions, promise, proof. */}
      <div
        className={cn(
          "relative z-20 flex flex-col items-center gap-5 px-5 pb-32 text-center transition-all delay-300 duration-1000 ease-out sm:gap-6 sm:px-8 sm:pb-20",
          mounted ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
        )}
      >
        <p className="max-w-[620px] text-[13px] leading-relaxed text-white/85 sm:text-[15px]">
          Weight and today&apos;s rate, shown on the scale before you decide — 22K and 18K gold, diamonds,
          gemstones and 92.5 silver.
          <span className="text-white/55"> Ask for anything in the case and we will lay it out for you.</span>
        </p>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-5">
          <Link
            href="/collections/all"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-8 py-3.5 text-[14px] font-medium text-black transition duration-200 hover:scale-[1.03] hover:shadow-[0_0_32px_4px_rgba(255,255,255,0.2)] active:scale-[0.97] sm:text-[15px]"
          >
            Explore the collection
          </Link>

          <a
            href={waLink(
              `Namaste ${SHOP.name}. I saw your website and would like to see some pieces at the counter.`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="liquid-glass inline-flex min-h-11 items-center gap-1.5 rounded-full px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.14em] text-white/85 transition-colors hover:text-white"
          >
            Ask us on WhatsApp
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
          </a>
        </div>

        <p className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.14em] text-white/55 sm:text-[11px]">
          <Lock size={13} strokeWidth={1.5} aria-hidden />
          Purity marked · priced by weight · {SHOP.address.city}
        </p>

        {/* Slide markers, quiet. */}
        <div className="hidden gap-1 sm:flex" role="tablist" aria-label="Hero photographs">
          {SLIDES.map((slide, index) => (
            <button
              key={slide.src}
              type="button"
              role="tab"
              aria-selected={index === active}
              aria-label={`Show photograph ${index + 1}`}
              onClick={() => setActive(index)}
              className="grid h-8 w-6 place-items-center"
            >
              <span
                className={cn(
                  "block h-[2px] w-6 rounded-full transition-colors duration-300",
                  index === active ? "bg-white" : "bg-white/25 hover:bg-white/60",
                )}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
