import type { MetadataRoute } from "next";
import { listProducts } from "@/lib/repo";
import { collections } from "@/lib/catalog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const { products } = await listProducts();

  const staticRoutes = [
    "",
    "/collections/all",
    "/visit",
    "/about",
    "/contact",
    "/shipping-returns",
    "/gold-rate-disclaimer",
    "/privacy",
    "/terms",
    "/wishlist",
    "/cart",
    "/login",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: (path === "" ? "daily" : "weekly") as "daily" | "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  const collectionRoutes = collections.map((c) => ({
    url: `${base}/collections/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const productRoutes = products.map((p) => ({
    url: `${base}/products/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...collectionRoutes, ...productRoutes];
}
