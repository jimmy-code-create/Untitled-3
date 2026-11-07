import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogueBrowser } from "@/components/catalogue/CatalogueBrowser";
import { PageShell, Breadcrumbs } from "@/components/layout/PageShell";
import { CATEGORY_LABELS, catalogueProducts } from "@/lib/catalogue";

/**
 * Collections pages now render the file-driven catalogue only. Nothing from the
 * old demo set is listed here; the page is a filter over the photographs in
 * public/images/catalogue.
 */
const LEGACY: Record<string, { title: string; sub: string; kicker: string; categories?: string[] }> = {
  all: {
    kicker: "The full house",
    title: "All Jewellery",
    sub: "Every piece we have photographed, listed by its code. Ask about any of them on WhatsApp.",
  },
  gold: {
    kicker: "Hallmarked gold",
    title: "Gold Collection",
    sub: "Rings, bangles, necklaces, pendants and mangalsutra in 22K and 18K gold.",
    categories: ["rings", "bangles", "necklaces", "pendants", "mangalsutra", "earrings", "bracelets", "nose-pins", "mens", "kids"],
  },
  silver: {
    kicker: "92.5 and 999 silver",
    title: "Silver Collection",
    sub: "Everyday silver, payal, coins and idols — priced from weight at the counter.",
    categories: ["silver", "silver-coins"],
  },
  diamond: {
    kicker: "Stone-set",
    title: "Diamond Collection",
    sub: "Solitaires, halos and clusters. Certificates available with the piece.",
    categories: ["diamond"],
  },
  gemstones: {
    kicker: "Colour stones",
    title: "Gemstone Collection",
    sub: "Ruby, emerald, sapphire and pearl pieces. Photographs are being added.",
    categories: [],
  },
  bridal: {
    kicker: "For the wedding season",
    title: "Bridal Collection",
    sub: "Necklaces, mangalsutra and bangles chosen with the family.",
    categories: ["necklaces", "mangalsutra", "bangles"],
  },
  gifting: {
    kicker: "Small things, kept forever",
    title: "Gifting",
    sub: "Pendants, earrings and rings for the occasions that matter.",
    categories: ["pendants", "earrings", "rings"],
  },
};

function infoFor(slug: string) {
  if (LEGACY[slug]) return LEGACY[slug];
  const label = CATEGORY_LABELS[slug];
  if (!label) return null;
  return {
    kicker: "Catalogue",
    title: label,
    sub: `Photographed ${label.toLowerCase()} from the shop, each with its own code.`,
    categories: [slug],
  };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const info = infoFor(slug);
  if (!info) return { title: "Catalogue" };
  return {
    title: `${info.title} — Hindaun`,
    description: `${info.sub} JMD Gems & Jewellery, Jagdamba Market, Mohan Nagar, Hindaun. WhatsApp 7891384376.`,
    alternates: { canonical: `/collections/${slug}` },
  };
}

export const revalidate = 60;

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const info = infoFor(slug);
  if (!info) notFound();

  const inScope = info.categories
    ? catalogueProducts.filter((product) => info.categories?.includes(product.category))
    : catalogueProducts;

  return (
    <PageShell>
      <div className="container-x">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Collections", href: "/collections/all" },
            { label: info.title },
          ]}
        />
        <header className="border-b border-copper/15 pb-8">
          <p className="label mb-3">{info.kicker}</p>
          <h1 className="font-serif text-4xl text-white sm:text-5xl">{info.title}</h1>
          <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-stone">{info.sub}</p>
          <p className="mt-2 text-[11px] uppercase tracking-[0.1em] text-stone/80">
            {inScope.length} {inScope.length === 1 ? "piece" : "pieces"} listed
          </p>
        </header>
      </div>
      <div className="mt-8">
        <CatalogueBrowser categories={info.categories} initialQuery={sp.q ?? ""} />
      </div>
    </PageShell>
  );
}
