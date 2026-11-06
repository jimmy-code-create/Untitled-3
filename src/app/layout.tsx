import type { Metadata, Viewport } from "next";
import "./fonts.css";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { ChromeGate } from "@/components/layout/ChromeGate";
import { TrackContact } from "@/components/analytics/TrackContact";
import { getSettings } from "@/lib/repo";
import { getPublicRates } from "@/lib/rates";
import { SHOP, fullAddress } from "@/lib/utils";
import { env } from "@/lib/env";

// Validates the environment contract at startup (throws on a malformed value).
void env;

const siteUrl = env.NEXTAUTH_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "JMD Gems & Jewellery — Gold, diamonds and stones in Hindaun",
    template: "%s · JMD Gems & Jewellery",
  },
  description:
    "JMD Gems & Jewellery, Jagdamba Market, Mohan Nagar, Hindaun — 22K/18K gold, diamonds, gemstones and 92.5 silver, priced from weight at the counter. WhatsApp 7891384376.",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    title: "JMD Gems & Jewellery — Hindaun",
    description: "Gold, diamonds and stones at Jagdamba Market, Hindaun. Weight and rate shown at the counter.",
    siteName: SHOP.name,
    images: [{ url: "/images/hero-necklace.webp", width: 1200, height: 750, alt: SHOP.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: "JMD Gems & Jewellery — Hindaun",
    description: "Gold, diamonds and stones at Jagdamba Market, Hindaun.",
    images: ["/images/hero-necklace.webp"],
  },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }], apple: [{ url: "/favicon.svg" }] },
};

export const viewport: Viewport = {
  themeColor: "#FDF1E6",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [rateInfo, settings] = await Promise.all([getPublicRates(), getSettings()]);

  /**
   * JewelryStore schema. Only confirmed facts go in here.
   * [CONFIRM WITH SHOP] opening hours, geo coordinates and the price range are
   * currently estimates — replace them with the shop's real values.
   */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JewelryStore",
    name: SHOP.name,
    image: `${siteUrl}/images/hero-necklace.webp`,
    "@id": siteUrl,
    url: siteUrl,
    telephone: SHOP.phones.map((p) => `+91${p}`),
    description: "Family jewellery shop in Jagdamba Market, Hindaun, Rajasthan.",
    address: {
      "@type": "PostalAddress",
      streetAddress: SHOP.address.line1,
      addressLocality: SHOP.address.city,
      addressRegion: SHOP.address.state,
      postalCode: SHOP.address.pincode,
      addressCountry: "IN",
    },
    sameAs: [`https://wa.me/${SHOP.whatsapp}`],
    areaServed: "Hindaun, Karauli district, Rajasthan",
  };

  return (
    <html lang="en">
      <body className="bg-cream">
        <Providers>
          <ChromeGate
            rates={rateInfo.rates}
            rateUpdatedAt={rateInfo.fetchedAt ?? rateInfo.updatedAt}
            staleLabel={rateInfo.staleLabel}
            settings={settings}
          >
            {children}
          </ChromeGate>
          <TrackContact />
        </Providers>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <span className="sr-only">{fullAddress}</span>
      </body>
    </html>
  );
}
