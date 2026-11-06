import { z } from "zod";
import { fail, ok, rateLimit, clientIp, requireAdmin } from "@/lib/api";
import { listProducts, saveProduct } from "@/lib/repo";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const limiter = rateLimit(`products:${clientIp(req)}`, 120, 60_000);
  if (!limiter.allowed) return fail("Too many requests", 429);

  const { searchParams } = new URL(req.url);
  const num = (key: string) => {
    const v = searchParams.get(key);
    return v !== null && v !== "" && !Number.isNaN(Number(v)) ? Number(v) : undefined;
  };

  const { products, total } = await listProducts({
    collection: searchParams.get("collection") ?? undefined,
    metal: searchParams.get("metal") ?? undefined,
    purity: searchParams.get("purity") ?? undefined,
    gemstone: searchParams.get("gemstone") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    occasion: searchParams.get("occasion") ?? undefined,
    q: searchParams.get("q") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
    minPrice: num("minPrice"),
    maxPrice: num("maxPrice"),
    minWeight: num("minWeight"),
    maxWeight: num("maxWeight"),
    limit: num("limit") ?? 12,
    offset: num("offset") ?? 0,
  });

  return ok({ products, total, hasMore: (num("offset") ?? 0) + products.length < total });
}

const productSchema = z.object({
  slug: z.string().min(2),
  name: z.string().min(2),
  nameHi: z.string().optional(),
  subtitle: z.string().optional(),
  description: z.string().min(5),
  story: z.string().optional(),
  metal: z.enum(["GOLD", "SILVER", "DIAMOND", "GEMSTONE"]),
  metalColor: z.enum(["YELLOW", "WHITE", "ROSE"]).optional(),
  purity: z.string(),
  weight: z.number().positive(),
  gemstoneValue: z.number().min(0),
  gemstoneCarats: z.number().min(0).optional(),
  gemstoneSlug: z.string().optional(),
  makingPct: z.number().min(0).max(100),
  images: z.array(z.string()).min(1),
  category: z.string(),
  collections: z.array(z.string()),
  occasions: z.array(z.string()).optional(),
  sizes: z.array(z.string()).optional(),
  badges: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  certificateNo: z.string().optional(),
  stock: z.number().int().min(0),
});

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorised", 401);

  const body = await req.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid product", 422);

  await saveProduct({
    ...parsed.data,
    metalColor: parsed.data.metalColor ?? "YELLOW",
    occasions: parsed.data.occasions ?? [],
    sizes: parsed.data.sizes ?? ["Free size"],
    badges: parsed.data.badges ?? [],
    certifications: parsed.data.certifications ?? ["BIS Hallmark"],
    rating: 4.8,
    reviewCount: 0,
    isNew: true,
  });

  return ok({ slug: parsed.data.slug });
}
