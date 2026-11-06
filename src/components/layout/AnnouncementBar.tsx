"use client";

import { useEffect, useState } from "react";
import { IconClose, IconDiya } from "@/components/icons/JmdIcons";

/**
 * 40px announcement strip. Dismissal is remembered for the browser session.
 * The line itself is owner-editable in /admin/settings.
 */
export function AnnouncementBar({ text }: { text: string }) {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    try {
      setHidden(sessionStorage.getItem("jmd-announcement-dismissed") === "1");
    } catch {
      setHidden(false);
    }
  }, []);

  if (hidden) return null;

  const dismiss = () => {
    setHidden(true);
    try {
      sessionStorage.setItem("jmd-announcement-dismissed", "1");
    } catch {
      /* private mode */
    }
  };

  return (
    <div
      className="relative flex h-10 items-center justify-center overflow-hidden px-12 text-cream"
      style={{ background: "linear-gradient(90deg, #4A0A0F 0%, #8B0A0A 100%)" }}
      role="region"
      aria-label="Shop announcement"
    >
      <span className="pointer-events-none absolute inset-0 opacity-70" aria-hidden>
        {[
          [8, 12],
          [22, 30],
          [37, 8],
          [53, 26],
          [68, 14],
          [82, 30],
          [93, 10],
        ].map(([left, top], i) => (
          <span
            key={i}
            className="absolute h-[3px] w-[3px] rotate-45 rounded-[1px] bg-gold-light/80"
            style={{ left: `${left}%`, top: `${top}px` }}
          />
        ))}
      </span>

      <IconDiya className="mr-2 hidden h-4 w-4 shrink-0 text-gold-light sm:block" size={16} />
      <p className="truncate text-center font-serif text-[12px] font-semibold tracking-[0.06em] text-cream sm:text-[13px]">
        {text}
      </p>
      <IconDiya className="ml-2 hidden h-4 w-4 shrink-0 text-gold-light sm:block" size={16} />

      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss announcement"
        className="absolute right-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-cream/70 text-cream transition-colors hover:bg-cream/10"
      >
        <IconClose size={14} />
      </button>
    </div>
  );
}
