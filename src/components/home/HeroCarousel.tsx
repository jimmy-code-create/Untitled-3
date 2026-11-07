"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";

const SLIDES = [
  {
    image: "/images/hero-necklace.webp",
    alt: "Layered gold necklace photographed for JMD Gems & Jewellery",
    kicker: "At the counter",
    title: "Gold, diamonds and stones",
    href: "/collections/all",
  },
  {
    image: "/images/bridal-hands.webp",
    alt: "Bridal gold jewellery on hands",
    kicker: "Wedding",
    title: "Bridal sets, laid out for you",
    href: "/collections/bridal",
  },
  {
    image: "/images/emerald-pendant.webp",
    alt: "Emerald pendant",
    kicker: "Gemstones",
    title: "Emeralds, rubies, sapphires",
    href: "/collections/gemstones",
  },
  {
    image: "/images/gold-bracelet.webp",
    alt: "Gold bracelet",
    kicker: "Everyday gold",
    title: "Light pieces for daily wear",
    href: "/collections/gold",
  },
  {
    image: "/images/silver-payal.webp",
    alt: "Silver payal",
    kicker: "Silver",
    title: "Silver payal and bangles",
    href: "/collections/silver",
  },
];

export function HeroCarousel() {
  const scroller = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || paused) return;
    const timer = window.setInterval(() => {
      setActive((current) => {
        const next = (current + 1) % SLIDES.length;
        const el = scroller.current;
        if (el) el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
        return next;
      });
    }, 4000);
    return () => window.clearInterval(timer);
  }, [paused, reduced]);

  useEffect(() => {
    const onVisibility = () => setPaused(document.visibilityState === "hidden");
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  return (
    <section className="bg-black px-4 pb-2 pt-3 sm:px-6">
      <div className="mx-auto max-w-content">
        <div
          ref={scroller}
          onPointerDown={() => setPaused(true)}
          onPointerUp={() => setPaused(false)}
          onPointerCancel={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setPaused(false)}
          onScroll={(e) => {
            const el = e.currentTarget;
            const index = Math.round(el.scrollLeft / Math.max(1, el.clientWidth));
            setActive(Math.min(SLIDES.length - 1, Math.max(0, index)));
          }}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto rounded-card"
          aria-roledescription="carousel"
          aria-label="Featured collections"
        >
          {SLIDES.map((slide, i) => (
            <div
              key={slide.image}
              className="relative aspect-square w-full shrink-0 snap-start overflow-hidden rounded-card bg-blush lg:aspect-[16/7]"
              aria-hidden={active !== i}
            >
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                priority={i === 0}
                sizes="(max-width: 1024px) 100vw, 1200px"
                className="object-cover"
              />
              <div className="absolute inset-x-3 bottom-3 rounded-[18px] bg-black/85 px-4 py-4 backdrop-blur-sm sm:inset-x-5 sm:bottom-5 sm:max-w-[420px] sm:px-6 sm:py-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gold-dark">
                  {slide.kicker}
                </p>
                <h1 className="mt-1 font-serif text-28 font-semibold leading-[1.08] text-ink sm:text-34">
                  {slide.title}
                </h1>
                <Link
                  href={slide.href}
                  className="mt-3 inline-flex min-h-10 items-center rounded-control bg-white px-5 text-[10px] font-semibold uppercase tracking-[0.12em] text-black transition-colors hover:bg-burgundy-dark"
                >
                  Explore now
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 py-3" role="tablist" aria-label="Choose slide">
          {SLIDES.map((slide, i) => (
            <button
              key={slide.image}
              type="button"
              role="tab"
              aria-selected={active === i}
              aria-label={`Slide ${i + 1}`}
              onClick={() => {
                const el = scroller.current;
                if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
                setActive(i);
              }}
              className="grid h-11 w-11 place-items-center"
            >
              <span className="diamond-dot" data-active={active === i} />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
