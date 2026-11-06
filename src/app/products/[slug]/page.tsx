import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct, listProducts } from "@/lib/repo";
import { ProductDetail } from "@/components/product/ProductDetail";
import { PageShell, Breadcrumbs } from "@/components/layout/PageShell";
import { SHOP } from "@/lib/utils";

export const revalidate = 30;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Piece not found" };
  const url = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/products/${product.slug}`;
  return {
    title: `${product.name} — ${product.purity} ${product.metal.toLowerCase()} · Hindaun`,
    description: `${product.description} Price ₹${product.price} at JMD Gems & Jewellery, Hindaun. Certificate ${product.certificateNo}. WhatsApp 7891384376.`,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.subtitle,
      url,
      type: "website",
      images: [{ url: product.images[0], width: 1400, height: 1750, alt: product.name }],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const { products } = await listProducts({ collection: product.collections[0] });
  const related = products.filter((p) => p.slug !== product.slug).slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product.slug,
    brand: { "@type": "Brand", name: SHOP.name },
    material: `${product.purity} ${product.metal.toLowerCase()}`,
    weight: { "@type": "QuantitativeValue", value: product.weight, unitCode: "GRM" },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.price,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
      seller: { "@type": "JewelryStore", name: SHOP.name },
      url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/products/${product.slug}`,
    },
  };

  return (
    <PageShell>
      <div className="container-x">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: product.collections[0] ?? "Collections", href: `/collections/${product.collections[0] ?? "all"}` },
            { label: product.name },
          ]}
        />
      </div>
      <ProductDetail product={product} related={related} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </PageShell>
  );
}
