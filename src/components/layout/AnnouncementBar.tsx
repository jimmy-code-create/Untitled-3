"use client";

import { useEffect, useRef, useState } from "react";
import { IconClose } from "@/components/icons/JmdIcons";

/**
 * Diwali offer strip.
 *
 * Two clay diyas with individually flickering flames, embers drifting upward,
 * a slow gold sheen across the text and a one-off garland draw when the bar
 * mounts. Everything is CSS/SVG, everything stops under
 * `prefers-reduced-motion`, and the copy still comes from /admin/settings so
 * the shop can change or switch it off.
 */
export function AnnouncementBar({ text }: { text: string }) {
  // Visible in the server HTML so the strip is part of first paint; a visitor
  // who dismissed it earlier gets it removed on hydration instead of a flash.
  const [hidden, setHidden] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("jmd-announcement-dismissed") === "1") setHidden(true);
    } catch {
      /* private mode — keep it visible */
    }
  }, []);

  if (hidden) return null;

  const dismiss = () => {
    setLeaving(true);
    window.setTimeout(() => {
      setHidden(true);
      try {
        sessionStorage.setItem("jmd-announcement-dismissed", "1");
      } catch {
        /* private mode */
      }
    }, 220);
  };

  return (
    <div
      ref={barRef}
      className={`festive-bar relative flex h-11 items-center justify-center overflow-hidden px-12 text-cream ${leaving ? "festive-bar-out" : ""}`}
      role="region"
      aria-label="Shop announcement"
    >
      {/* gold sheen sweeping the whole bar */}
      <span className="festive-sheen pointer-events-none absolute inset-0" aria-hidden />

      {/* embers */}
      <span className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {[4, 13, 21, 33, 44, 56, 67, 76, 85, 94].map((left, i) => (
          <span
            key={left}
            className="ember"
            style={{
              left: `${left}%`,
              animationDelay: `${(i % 5) * 0.7}s`,
              animationDuration: `${3.6 + (i % 4) * 0.8}s`,
            }}
          />
        ))}
      </span>

      <Diya className="mr-2.5" delay="0s" />
      <p className="festive-text relative truncate text-center font-serif text-[12.5px] font-semibold tracking-[0.05em] sm:text-[13.5px]">
        {text}
      </p>
      <Diya className="ml-2.5" delay="0.45s" />

      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss announcement"
        className="absolute right-1.5 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center text-cream/85 transition-colors hover:text-cream"
      >
        <IconClose size={14} />
      </button>
    </div>
  );
}

/** Clay diya with a flame that breathes on its own rhythm. */
function Diya({ className, delay }: { className?: string; delay: string }) {
  return (
    <span className={`relative hidden shrink-0 sm:inline-flex ${className ?? ""}`} aria-hidden>
      <svg viewBox="0 0 48 34" className="h-[22px] w-[32px] overflow-visible">
        <defs>
          <radialGradient id="flameGrad" cx="50%" cy="70%" r="60%">
            <stop offset="0%" stopColor="#FFF3C4" />
            <stop offset="55%" stopColor="#FFC24A" />
            <stop offset="100%" stopColor="#E07A18" stopOpacity="0.15" />
          </radialGradient>
        </defs>
        <ellipse className="diya-glow" cx="24" cy="12" rx="9" ry="9" fill="#FFB347" opacity="0.22" />
        <path
          className="diya-flame"
          style={{ animationDelay: delay }}
          d="M24 3c2.6 3.4 4.4 5.6 4.4 8.2a4.4 4.4 0 1 1-8.8 0C19.6 8.6 21.4 6.4 24 3Z"
          fill="url(#flameGrad)"
        />
        <path d="M8 20h32c-1.8 6.4-7.6 10-16 10S9.8 26.4 8 20Z" fill="#8A4526" />
        <path d="M8 20h32c-.5 1.6-1.2 3-2.2 4.3H10.2A12 12 0 0 1 8 20Z" fill="#A85B33" />
        <path d="M8 20c0-1.6 7.2-2.6 16-2.6s16 1 16 2.6" fill="#6E3319" opacity="0.55" />
      </svg>
    </span>
  );
}
