"use client";

import { useEffect } from "react";

/**
 * Tracks outbound contact clicks without a third-party script. Events are
 * pushed to window.dataLayer (the GTM convention) so the shop can connect any
 * analytics later; nothing is sent anywhere until a tag manager is added.
 */
export function TrackContact() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-track]");
      if (!target) return;

      const kind = target.dataset.track;
      const href = target.getAttribute("href") ?? "";
      const isWhatsApp = href.startsWith("https://wa.me/");
      const w = window as typeof window & { dataLayer?: Record<string, unknown>[] };

      w.dataLayer = w.dataLayer ?? [];
      w.dataLayer.push({
        event: "contact_click",
        contact_method: isWhatsApp ? "whatsapp" : (kind ?? "unknown"),
        link_url: href,
        page_path: window.location.pathname,
      });
    };

    document.addEventListener("click", onClick, { passive: true });
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
