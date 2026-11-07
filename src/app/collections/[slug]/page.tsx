import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listProducts } from "@/lib/repo";
import { collections } from "@/lib/catalog";
import { ProductListing } from "@/components/product/ProductListing";
import { PageShell, Breadcrumbs } from "@/components/layout/PageShell";

const TITLES: Record<string, { title: string; sub: string; kicker: string }> = {
  all: {
    kicker: "The full house",
    title: "All Jewellery",
    sub: "Every piece in the store — gold, silver, diamonds and certified gemstones.",
  },
  gold: {
    kicker: "Hallmarked 22K & 18K",
    title: "Gold Collection",
    sub: "Traditional Hindaun craftsmanship, weighed and hallmarked in front of you.",
  },
  silver: {
    kicker: "92.5 purity",
    title: "Silver Collection",
    sub: "Everyday silver — payal, bracelets and bands, rhodium finished.",
  },
  diamond: {
    kicker: "IGI certified",
    title: "Diamond Collection",
    sub: "Solitaires, halos and tennis lines with certificates for every stone.",
  },
  gemstones: {
    kicker: "Navratna & birthstones",
    title: "Gemstone Collection",
    sub: "Ruby, emerald, sapphire, pearl and more — lab certified, honestly priced.",
  },
  bridal: {
    kicker: "For the wedding season",
    title: "Bridal Collection",
    sub: "Complete sets and heirlooms chosen with the family, not for the family.",
  },
  gifting: {
    kicker: "Small things, kept forever",
    title: "Gifting",
    sub: "Pendants, bands and bracelets that arrive in a JMD keepsake box.",
  },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const info = TITLES[slug];
  if (!info) return { title: "Collection" };
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
  searchParams: Promise<{ q?: string; occasion?: string; gemstone?: string }>;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const valid = slug === "all" || collections.some((c) => c.slug === slug) || slug === "gifting";
  if (!valid) notFound();

  const { products, total } = await listProducts({
    collection: slug === "all" ? undefined : slug,
    q: sp.q,
    occasion: sp.occasion,
    gemstone: sp.gemstone,
    limit: 24,
  });

  const info = TITLES[slug] ?? TITLES.all;

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
          <h1 className="font-serif text-4xl text-navy sm:text-5xl">{info.title}</h1>
          <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-stone">{info.sub}</p>
        </header>
      </div>
      <div className="mt-8">
        <ProductListing
          initialProducts={products}
          total={total}
          collection={slug}
          initialQuery={sp.q ?? ""}
          initialOccasion={sp.occasion ?? ""}
          initialGemstone={sp.gemstone ?? ""}
        />
      </div>
    </PageShell>
  );
}
