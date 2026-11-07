"use client";

import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "light" | "dark";
  className?: string;
  /** Hide the script tagline (compact contexts) */
  compact?: boolean;
  size?: "sm" | "md" | "lg";
}

const pillSizes = {
  sm: "px-2.5 py-1 text-[12px] tracking-[0.24em]",
  md: "px-4 py-1.5 text-[16px] tracking-[0.26em]",
  lg: "px-6 py-2.5 text-[24px] tracking-[0.3em]",
};

const scriptSizes = {
  sm: "text-[9px]",
  md: "text-[11px]",
  lg: "text-[14px]",
};

/**
 * Animated shop signboard.
 *
 * A dark plaque with a gold hairline that draws itself once, a connoisseur's
 * sheen that crosses the letters every few seconds, and a single spark that
 * catches the top-right corner. Motion is decorative only and is switched off
 * under `prefers-reduced-motion`.
 */
export function Logo({ variant = "dark", compact = false, className, size = "md" }: LogoProps) {
  return (
    <span className={cn("logo-lockup inline-flex select-none flex-col items-center leading-none", className)}>
      <span
        className={cn(
          "logo-plaque relative inline-flex items-center justify-center overflow-hidden rounded-[9px] border font-sans font-semibold uppercase text-gold-light",
          variant === "light"
            ? "border-gold/50 bg-burgundy-deep"
            : "border-gold/45 bg-burgundy-dark shadow-[0_4px_14px_-8px_rgba(46,6,9,0.6)]",
          pillSizes[size],
        )}
        aria-label="JMD"
      >
        <span className="relative z-10">JMD</span>

        {/* looping gold sheen */}
        <span className="logo-sheen" aria-hidden />
        {/* hairline that draws itself in on first paint */}
        <span className="logo-trace" aria-hidden />
        {/* a single spark at the corner */}
        <span className="logo-spark" aria-hidden />
      </span>
      {!compact && (
        <span
          className={cn(
            "logo-script mt-1 font-serif font-semibold italic",
            variant === "light" ? "text-gold-light/90" : "text-burgundy",
            scriptSizes[size],
          )}
        >
          Gems &amp; Jewellery
        </span>
      )}
    </span>
  );
}

export default Logo;
