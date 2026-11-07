import type { Metadata } from "next";
import { CinematicHero } from "@/components/home/CinematicHero";
import { CollectionsFeature } from "@/components/home/CollectionsFeature";
import { WorldOfJmd } from "@/components/home/WorldOfJmd";
import { GiftBanner } from "@/components/home/GiftBanner";
import { ExchangeCard } from "@/components/home/ExchangeCard";
import { Assurance } from "@/components/home/Assurance";
import { Trending } from "@/components/home/Trending";
import { VisitShop } from "@/components/home/VisitShop";
import { Divider } from "@/components/ui/Divider";
import { getFeatured, getSettings } from "@/lib/repo";
import { SHOP, fullAddress } from "@/lib/utils";

export const metadata: Metadata = {
  title: "JMD Gems & Jewellery — Gold, diamonds and stones in Hindaun",
  description:
    "JMD Gems & Jewellery, Jagdamba Market, Mohan Nagar, Hindaun. 22K and 18K gold, diamonds, gemstones and 92.5 silver, priced from weight at the counter.",
  alternates: { canonical: "/" },
};

export const revalidate = 60;

export default async function HomePage() {
  const [featured, settings] = await Promise.all([getFeatured(8), getSettings()]);

  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SHOP.name,
    url: process.env.NEXTAUTH_URL || "http://localhost:3000",
    address: fullAddress,
    potentialAction: {
      "@type": "SearchAction",
      target: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/collections/all?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <CinematicHero />
      <CollectionsFeature />
      <WorldOfJmd />
      <GiftBanner settings={settings} />
      <ExchangeCard settings={settings} />
      <Divider />
      <Assurance settings={settings} />
      <Trending items={featured} />
      <Divider />
      <VisitShop />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }} />
    </>
  );
}
