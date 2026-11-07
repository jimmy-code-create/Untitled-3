"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { IconClose, IconWhatsApp } from "@/components/icons/JmdIcons";
import { usePageMeta } from "@/store/meta";
import { SHOP, waLink } from "@/lib/utils";

/**
 * Floating WhatsApp helper. A 64px green button with a dismissible white
 * speech pill. No pulsing ring, no auto-opening chat.
 */
export function FloatingHelper() {
  const pathname = usePathname();
  const { productName } = usePageMeta();
  const [showBubble, setShowBubble] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    try {
      setShowBubble(sessionStorage.getItem("jmd-helper-dismissed") !== "1");
    } catch {
      setShowBubble(true);
    }
  }, []);

  /* Keep the hero clear: the speech pill only joins once the page moves. */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 420);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname.startsWith("/admin")) return null;

  const onProduct = pathname.startsWith("/products/") && productName;
  const message = onProduct
    ? `Namaste JMD Gems & Jewellery. I am asking about ${productName}. Please share the weight, making charge and availability.`
    : "Namaste! I would like to ask about a piece.";

  const dismiss = () => {
    setShowBubble(false);
    try {
      sessionStorage.setItem("jmd-helper-dismissed", "1");
    } catch {
      /* private mode */
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex items-center gap-2 sm:bottom-6 sm:right-6">
      {showBubble && scrolled ? (
        <div className="flex max-w-[230px] items-center gap-2 rounded-control border border-white/10 bg-white/[0.04] py-2 pl-4 pr-1.5 shadow-card">
          <p className="text-[12px] leading-tight text-ink">Namaste! How can I help you?</p>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss chat message"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-bodygrey/70 hover:bg-blush"
          >
            <IconClose size={14} />
          </button>
        </div>
      ) : null}

      <a
        href={waLink(message)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Chat with ${SHOP.name} on WhatsApp`}
        data-track="whatsapp-float"
        className="grid h-16 w-16 place-items-center rounded-full bg-whatsapp text-white shadow-[0_10px_24px_-10px_rgba(15,122,61,0.7)] transition-transform hover:scale-105"
      >
        <IconWhatsApp size={30} />
      </a>
    </div>
  );
}
