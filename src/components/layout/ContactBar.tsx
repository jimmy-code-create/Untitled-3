"use client";

import { usePathname } from "next/navigation";
import { Navigation, Phone } from "lucide-react";
import { usePageMeta } from "@/store/meta";
import { SHOP, mapsLink, telLink, waLink } from "@/lib/utils";

/**
 * Contact bar. On phones it is a sticky bottom bar with Call / WhatsApp /
 * Directions (44px targets). On desktop it drops to a single WhatsApp button.
 * No pulsing ring, no auto-showing tooltip.
 */
export function ContactBar() {
  const pathname = usePathname();
  const { productName, productSlug } = usePageMeta();

  if (pathname.startsWith("/admin")) return null;

  const onProduct = pathname.startsWith("/products/") && productName && productSlug;
  const message = onProduct
    ? `Namaste JMD Gems & Jewellery. I am asking about ${productName}. Please share the weight, making charge and availability.`
    : "Namaste JMD Gems & Jewellery. I would like to ask about a piece.";

  return (
    <>
      {/* Mobile sticky bar */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-navy/15 bg-black shadow-sticky lg:hidden">
        <div className="grid grid-cols-3">
          <a
            href={telLink(SHOP.phones[0])}
            className="flex min-h-14 items-center justify-center gap-2 border-r border-navy/15 text-12 uppercase tracking-label text-white"
            data-track="call"
          >
            <Phone className="h-4 w-4" strokeWidth={1.5} aria-hidden /> Call
          </a>
          <a
            href={waLink(message)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-14 items-center justify-center gap-2 bg-whatsapp text-12 uppercase tracking-label text-white"
            data-track="whatsapp-float"
          >
            <svg viewBox="0 0 32 32" className="h-4 w-4 fill-current" aria-hidden>
              <path d="M16.04 3.2c-7.06 0-12.8 5.73-12.8 12.8 0 2.26.59 4.47 1.71 6.42L3.2 28.8l6.56-1.72a12.75 12.75 0 0 0 6.28 1.63h.01c7.06 0 12.8-5.74 12.8-12.8 0-3.42-1.33-6.63-3.75-9.05a12.7 12.7 0 0 0-9.06-3.66Z" />
            </svg>
            WhatsApp
          </a>
          <a
            href={mapsLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-14 items-center justify-center gap-2 border-l border-navy/15 text-12 uppercase tracking-label text-white"
            data-track="directions"
          >
            <Navigation className="h-4 w-4" strokeWidth={1.5} aria-hidden /> Directions
          </a>
        </div>
      </div>

      {/* Desktop floating WhatsApp */}
      <a
        href={waLink(message)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Chat with ${SHOP.name} on WhatsApp`}
        data-track="whatsapp-float"
        className="fixed bottom-6 right-6 z-50 hidden min-h-12 items-center gap-2 rounded-control bg-whatsapp px-4 text-12 uppercase tracking-label text-white hover:bg-[#0F7038] lg:inline-flex"
      >
        <svg viewBox="0 0 32 32" className="h-4 w-4 fill-current" aria-hidden>
          <path d="M16.04 3.2c-7.06 0-12.8 5.73-12.8 12.8 0 2.26.59 4.47 1.71 6.42L3.2 28.8l6.56-1.72a12.75 12.75 0 0 0 6.28 1.63h.01c7.06 0 12.8-5.74 12.8-12.8 0-3.42-1.33-6.63-3.75-9.05a12.7 12.7 0 0 0-9.06-3.66Z" />
        </svg>
        WhatsApp
      </a>
    </>
  );
}
