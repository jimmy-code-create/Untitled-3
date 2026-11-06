"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Fade-up reveal (16px, 400ms, once) for every top-level section.
 * Skipped entirely when the visitor prefers reduced motion.
 */
export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const sections = Array.from(document.querySelectorAll<HTMLElement>("main section"));
    if (!sections.length) return;

    sections.forEach((section) => section.classList.add("reveal-up"));

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-in");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "-40px 0px -10% 0px", threshold: 0.01 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => {
      observer.disconnect();
      sections.forEach((section) => {
        section.classList.remove("reveal-up", "reveal-in");
      });
    };
  }, [pathname]);

  return null;
}
