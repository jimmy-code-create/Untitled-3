import { computeBreakup, DEFAULT_RATES, rateKey, type RateMap } from "./pricing";
import { products as catalogProducts, type CatalogProduct } from "./catalog";
import { readDemo, writeDemo, type DemoEnquiry, type DemoOrder, type DemoRate } from "./demo-db";
import { orderNumber } from "./utils";
import { mergeSettings, type ShopSettings } from "./settings";
import { convertSpotToRates } from "./rate-math";
import { readSpot } from "./spot-cache";

/**
 * Repository layer. Every read/write goes through here.
 * Uses Postgres via Prisma when DATABASE_URL is set and reachable, and falls
 * back to the local JSON store otherwise so the site is always usable.
 */

export type ProductView = CatalogProduct & {
  price: number;
  breakup: ReturnType<typeof computeBreakup>;
  mrp: number;
  inStock: boolean;
};

export interface ProductFilters {
  collection?: string;
  metal?: string;
  purity?: string;
  gemstone?: string;
  category?: string;
  occasion?: string;
  minPrice?: number;
  maxPrice?: number;
  minWeight?: number;
  maxWeight?: number;
  sort?: string;
  q?: string;
  limit?: number;
  offset?: number;
}

let prismaPromise: Promise<any> | null = null;

/** Editorial pieces maintained in catalog.ts (the file-driven catalogue lives in src/lib/catalogue.ts). */
export const allCatalogProducts: CatalogProduct[] = [...catalogProducts];

export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

export async function getPrisma(): Promise<any | null> {
  if (!hasDatabase()) return null;
  if (!prismaPromise) {
    prismaPromise = (async () => {
      try {
        const mod = await import("@prisma/client");
        const PrismaClient = (mod as any).PrismaClient;
        const client = new PrismaClient();
        await client.$connect();
        await client.metalRate.count();
        return client;
      } catch {
        return null;
      }
    })();
  }
  return prismaPromise;
}

/* ────────────────────────────── rates ────────────────────────────── */

export async function getRates(): Promise<RateMap> {
  const stored = await storedRates();
  const settings = await getSettings();
  const config = settings.rateConfig;
  if (config.provider === "manual") return stored;

  // Live overlay: the 3-minute proxy cache supplies the spot snapshot, so this
  // is cheap and every visitor sees the same number without extra upstream calls.
  const spot = await readSpot(config.provider);
  if (!spot) return stored;

  const computed = convertSpotToRates(spot, config);
  const next: RateMap = { ...stored };
  for (const [purity, value] of Object.entries(computed)) {
    const live = purity.startsWith("SILVER") ? config.useLiveFeed.silver : config.useLiveFeed.gold;
    if (live && value > 0) next[purity] = Math.round(value + config.shopRulePerGram);
  }
  return next;
}

/** The owner's published rows — also the fallback when no feed answers. */
async function storedRates(): Promise<RateMap> {
  const prisma = await getPrisma();
  if (prisma) {
    try {
      const rows = await prisma.metalRate.findMany();
      if (rows.length) {
        return rows.reduce((acc: RateMap, r: any) => {
          acc[r.purity] = r.ratePerGram;
          return acc;
        }, {} as RateMap);
      }
    } catch {
      /* fall through */
    }
  }
  const demo = readDemo();
  return demo.rates.reduce<RateMap>((acc, r) => {
    acc[r.purity] = r.ratePerGram;
    return acc;
  }, { ...DEFAULT_RATES });
}

export async function getRateRows(): Promise<DemoRate[]> {
  const prisma = await getPrisma();
  if (prisma) {
    try {
      const rows = await prisma.metalRate.findMany({ orderBy: { purity: "asc" } });
      if (rows.length) {
        return rows.map((r: any) => ({
          id: r.id,
          metal: r.metal,
          purity: r.purity,
          ratePerGram: r.ratePerGram,
          updatedAt: new Date(r.updatedAt).toISOString(),
        }));
      }
    } catch {
      /* fall through */
    }
  }
  return readDemo().rates;
}

export async function saveRates(updates: { purity: string; ratePerGram: number }[]) {
  const prisma = await getPrisma();
  if (prisma) {
    try {
      for (const u of updates) {
        await prisma.metalRate.upsert({
          where: { purity: u.purity },
          update: { ratePerGram: u.ratePerGram },
          create: {
            purity: u.purity,
            ratePerGram: u.ratePerGram,
            metal: u.purity.startsWith("SILVER") ? "SILVER" : "GOLD",
          },
        });
      }
      return true;
    } catch {
      /* fall through */
    }
  }
  const demo = readDemo();
  demo.rates = demo.rates.map((r) => {
    const found = updates.find((u) => u.purity === r.purity);
    return found ? { ...r, ratePerGram: found.ratePerGram, updatedAt: new Date().toISOString() } : r;
  });
  writeDemo(demo);
  return true;
}

/* ───────────────────────────── settings ───────────────────────────── */

export async function getSettings(): Promise<ShopSettings> {
  const prisma = await getPrisma();
  if (prisma) {
    try {
      const store = await prisma.storeInfo.findFirst();
      if (store) {
        return mergeSettings({
          ...(store.settings && typeof store.settings === "object" ? store.settings : {}),
          festivalMode: store.festivalMode,
        });
      }
    } catch {
      /* fall through */
    }
  }
  return mergeSettings(readDemo().settings);
}

export async function updateSettings(patch: Partial<ShopSettings>) {
  const current = await getSettings();
  const next = mergeSettings({ ...current, ...patch });

  const prisma = await getPrisma();
  if (prisma) {
    try {
      const store = await prisma.storeInfo.findFirst();
      if (store) {
        await prisma.storeInfo.update({
          where: { id: store.id },
          data: { festivalMode: next.festivalMode, settings: next as any },
        });
      }
      return next;
    } catch {
      /* fall through */
    }
  }
  const demo = readDemo();
  demo.settings = next;
  writeDemo(demo);
  return next;
}

export async function setFestivalMode(enabled: boolean) {
  await updateSettings({ festivalMode: enabled });
  return true;
}

/* ───────────────────────────── products ───────────────────────────── */

function decorate(p: CatalogProduct, rates: RateMap): ProductView {
  const breakup = computeBreakup(
    {
      metal: p.metal,
      purity: p.purity,
      weight: p.weight,
      gemstoneValue: p.gemstoneValue,
      makingPct: p.makingPct,
    },
    rates,
  );
  return {
    ...p,
    price: breakup.total,
    breakup,
    mrp: Math.round((breakup.total * 1.18) / 100) * 100,
    inStock: p.stock > 0,
  };
}

function matches(p: ProductView, f: ProductFilters) {
  if (f.collection && !p.collections.includes(f.collection)) return false;
  if (f.metal && p.metal !== f.metal) return false;
  if (f.purity && p.purity !== f.purity) return false;
  if (f.gemstone && p.gemstoneSlug !== f.gemstone) return false;
  if (f.category && p.category !== f.category) return false;
  if (f.occasion && !p.occasions.includes(f.occasion)) return false;
  if (typeof f.minPrice === "number" && p.price < f.minPrice) return false;
  if (typeof f.maxPrice === "number" && p.price > f.maxPrice) return false;
  if (typeof f.minWeight === "number" && p.weight < f.minWeight) return false;
  if (typeof f.maxWeight === "number" && p.weight > f.maxWeight) return false;
  if (f.q) {
    const needle = f.q.toLowerCase();
    const hay = `${p.name} ${p.nameHi} ${p.subtitle} ${p.collections.join(" ")} ${p.occasions.join(" ")} ${p.gemstoneSlug ?? ""}`.toLowerCase();
    if (!hay.includes(needle)) return false;
  }
  return true;
}

function sortProducts(list: ProductView[], sort?: string) {
  const clone = [...list];
  switch (sort) {
    case "price-asc":
      return clone.sort((a, b) => a.price - b.price);
    case "price-desc":
      return clone.sort((a, b) => b.price - a.price);
    case "new":
      return clone.sort((a, b) => Number(b.isNew ?? false) - Number(a.isNew ?? false));
    case "weight":
      return clone.sort((a, b) => b.weight - a.weight);
    case "rating":
      return clone.sort((a, b) => b.rating - a.rating);
    default:
      return clone.sort(
        (a, b) => Number(b.bestseller ?? false) - Number(a.bestseller ?? false) || b.reviewCount - a.reviewCount,
      );
  }
}

export async function listProducts(filters: ProductFilters = {}) {
  const rates = await getRates();
  const prisma = await getPrisma();
  let base: CatalogProduct[] = catalogProducts;

  if (prisma) {
    try {
      const rows = await prisma.product.findMany({ where: { isActive: true }, include: { gemstone: true } });
      if (rows.length) {
        base = rows.map((r: any) => ({
          slug: r.slug,
          name: r.name,
          nameHi: r.nameHi ?? "",
          subtitle: r.subtitle ?? "",
          description: r.description,
          story: r.story ?? "",
          metal: r.metal,
          metalColor: r.metalColor,
          purity: r.purity,
          weight: r.metalWeight,
          gemstoneValue: r.gemstoneValue,
          gemstoneCarats: r.gemstoneCarats ?? undefined,
          gemstoneSlug: r.gemstone?.slug,
          makingPct: r.makingPct,
          images: r.images,
          category: r.category?.slug ?? "necklace",
          collections: r.collections,
          occasions: r.occasions,
          sizes: r.sizes,
          badges: r.badges,
          certifications: r.certifications,
          certificateNo: r.certificateNo ?? "",
          stock: r.stock,
          rating: r.rating,
          reviewCount: r.reviewCount,
          featured: r.isFeatured,
          isNew: r.isNew,
          bestseller: r.isBestseller,
        }));
      }
    } catch {
      /* fall through to catalogue */
    }
  } else {
    const demo = readDemo();
    base = demo.products;
  }

  let list = base.map((p) => decorate(p, rates)).filter((p) => matches(p, filters));
  list = sortProducts(list, filters.sort);
  const total = list.length;
  const offset = filters.offset ?? 0;
  const limit = filters.limit ?? total;
  return { products: list.slice(offset, offset + limit), total };
}

export async function getProduct(slug: string): Promise<ProductView | null> {
  const rates = await getRates();
  const prisma = await getPrisma();
  if (prisma) {
    try {
      const r = await prisma.product.findUnique({ where: { slug }, include: { gemstone: true, category: true } });
      if (r) {
        return decorate(
          {
            slug: r.slug,
            name: r.name,
            nameHi: r.nameHi ?? "",
            subtitle: r.subtitle ?? "",
            description: r.description,
            story: r.story ?? "",
            metal: r.metal,
            metalColor: r.metalColor,
            purity: r.purity,
            weight: r.metalWeight,
            gemstoneValue: r.gemstoneValue,
            gemstoneCarats: r.gemstoneCarats ?? undefined,
            gemstoneSlug: r.gemstone?.slug,
            makingPct: r.makingPct,
            images: r.images,
            category: r.category?.slug ?? "necklace",
            collections: r.collections,
            occasions: r.occasions,
            sizes: r.sizes,
            badges: r.badges,
            certifications: r.certifications,
            certificateNo: r.certificateNo ?? "",
            stock: r.stock,
            rating: r.rating,
            reviewCount: r.reviewCount,
            featured: r.isFeatured,
            isNew: r.isNew,
            bestseller: r.isBestseller,
          },
          rates,
        );
      }
    } catch {
      /* fall through */
    }
  }
  const demo = readDemo();
  const found = demo.products.find((p) => p.slug === slug);
  return found ? decorate(found, rates) : null;
}

export async function getProductsBySlugs(slugs: string[]): Promise<ProductView[]> {
  const rates = await getRates();
  const { products } = await listProducts();
  return slugs
    .map((s) => products.find((p) => p.slug === s))
    .filter(Boolean)
    .map((p) => p as ProductView);
}

export async function getFeatured(limit = 8) {
  const { products } = await listProducts();
  const featured = products.filter((p) => p.featured || p.bestseller);
  return (featured.length ? featured : products).slice(0, limit);
}

export async function getBridal() {
  const { products } = await listProducts({ collection: "bridal" });
  return products;
}

export async function saveProduct(input: Partial<CatalogProduct> & { slug: string }) {
  const prisma = await getPrisma();
  if (prisma) {
    try {
      const category = input.category
        ? await prisma.category.findUnique({ where: { slug: input.category } })
        : null;
      const gemstone = input.gemstoneSlug
        ? await prisma.gemstone.findUnique({ where: { slug: input.gemstoneSlug } })
        : null;
      await prisma.product.upsert({
        where: { slug: input.slug },
        update: toPrismaProduct(input, category?.id, gemstone?.id),
        create: {
          ...toPrismaProduct(input, category?.id, gemstone?.id),
          slug: input.slug,
          name: input.name ?? input.slug,
          description: input.description ?? "",
          metalWeight: input.weight ?? 1,
          images: input.images ?? [],
        },
      });
      return true;
    } catch {
      /* fall through */
    }
  }
  const demo = readDemo();
  const idx = demo.products.findIndex((p) => p.slug === input.slug);
  if (idx >= 0) demo.products[idx] = { ...demo.products[idx], ...input } as CatalogProduct;
  else demo.products.unshift(input as CatalogProduct);
  writeDemo(demo);
  return true;
}

function toPrismaProduct(input: Partial<CatalogProduct>, categoryId?: string, gemstoneId?: string) {
  return {
    name: input.name,
    nameHi: input.nameHi,
    subtitle: input.subtitle,
    description: input.description,
    story: input.story,
    metal: (input.metal as any) ?? "GOLD",
    metalColor: (input.metalColor as any) ?? "YELLOW",
    purity: input.purity ?? "22K",
    metalWeight: input.weight ?? 1,
    gemstoneValue: input.gemstoneValue ?? 0,
    gemstoneCarats: input.gemstoneCarats,
    makingPct: input.makingPct ?? 12,
    images: input.images ?? [],
    collections: input.collections ?? [],
    occasions: input.occasions ?? [],
    sizes: input.sizes ?? [],
    badges: input.badges ?? [],
    certifications: input.certifications ?? [],
    certificateNo: input.certificateNo,
    stock: input.stock ?? 0,
    rating: input.rating ?? 4.8,
    reviewCount: input.reviewCount ?? 0,
    isFeatured: input.featured ?? false,
    isNew: input.isNew ?? false,
    isBestseller: input.bestseller ?? false,
    categoryId,
    gemstoneId,
  };
}

export async function deleteProduct(slug: string) {
  const prisma = await getPrisma();
  if (prisma) {
    try {
      await prisma.product.delete({ where: { slug } });
      return true;
    } catch {
      /* fall through */
    }
  }
  const demo = readDemo();
  demo.products = demo.products.filter((p) => p.slug !== slug);
  writeDemo(demo);
  return true;
}

/* ───────────────────────────── orders ───────────────────────────── */

export async function createOrder(order: Omit<DemoOrder, "id" | "orderNumber" | "createdAt">) {
  const prisma = await getPrisma();
  const number = orderNumber();
  if (prisma) {
    try {
      const created = await prisma.order.create({
        data: {
          orderNumber: number,
          email: order.email,
          phone: order.phone,
          customerName: order.customerName,
          status: "PENDING",
          paymentStatus: order.paymentStatus as any,
          paymentMethod: order.paymentMethod as any,
          fulfillment: order.fulfillment as any,
          subtotal: order.subtotal,
          gst: order.gst,
          shipping: order.shipping,
          total: order.total,
          goldRate: order.goldRate,
          rateSnapshot: (order.rateSnapshot ?? null) as any,
          rateSnapshotId: order.rateSnapshotId ?? null,
          priceBreakup: (order.priceBreakup ?? null) as any,
          priceLockedUntil: order.priceLockedUntil ? new Date(order.priceLockedUntil) : null,
          shippingAddress: order.address,
          razorpayOrderId: order.razorpayOrderId,
          items: {
            create: await Promise.all(
              order.items.map(async (item) => {
                const product = await prisma.product.findUnique({ where: { slug: item.slug } });
                return {
                  productId: product?.id ?? "",
                  slug: item.slug,
                  name: item.name,
                  image: item.image,
                  size: item.size,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                  metalWeight: item.metalWeight,
                  gemstoneValue: item.gemstoneValue,
                  makingCharges: item.makingCharges,
                  gst: item.gst,
                  ratePerGram: item.ratePerGram ?? null,
                  goldValue: item.goldValue ?? null,
                  priceBreakup: (item.priceBreakup ?? null) as any,
                };
              }),
            ),
          },
        },
      });
      return { ...order, id: created.id, orderNumber: created.orderNumber, createdAt: created.createdAt.toISOString() } as DemoOrder;
    } catch {
      /* fall through */
    }
  }
  const demo = readDemo();
  const created: DemoOrder = {
    ...order,
    id: `order-${Date.now()}`,
    orderNumber: number,
    createdAt: new Date().toISOString(),
  };
  demo.orders.unshift(created);
  writeDemo(demo);
  return created;
}

export async function listOrders(email?: string) {
  const prisma = await getPrisma();
  if (prisma) {
    try {
      const rows = await prisma.order.findMany({
        where: email ? { email } : undefined,
        orderBy: { createdAt: "desc" },
        include: { items: true },
      });
      return rows.map((r: any) => ({
        id: r.id,
        orderNumber: r.orderNumber,
        email: r.email,
        phone: r.phone ?? "",
        customerName: r.customerName ?? "",
        status: r.status,
        paymentStatus: r.paymentStatus,
        paymentMethod: r.paymentMethod,
        fulfillment: r.fulfillment,
        subtotal: r.subtotal,
        gst: r.gst,
        shipping: r.shipping,
        total: r.total,
        goldRate: r.goldRate,
        address: r.shippingAddress as Record<string, string>,
        items: r.items.map((i: any) => ({
          slug: i.slug,
          name: i.name,
          image: i.image,
          size: i.size ?? "",
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          metalWeight: i.metalWeight,
          gemstoneValue: i.gemstoneValue,
          makingCharges: i.makingCharges,
          gst: i.gst,
        })),
        trackingNo: r.trackingNo ?? undefined,
        courier: r.courier ?? undefined,
        createdAt: r.createdAt.toISOString(),
      })) as DemoOrder[];
    } catch {
      /* fall through */
    }
  }
  const demo = readDemo();
  return email ? demo.orders.filter((o) => o.email === email) : demo.orders;
}

export async function getOrder(orderNumberOrId: string) {
  const all = await listOrders();
  return (
    all.find((o) => o.orderNumber === orderNumberOrId || o.id === orderNumberOrId) ?? null
  );
}

export async function updateOrder(
  id: string,
  patch: Partial<
    Pick<
      DemoOrder,
      "status" | "paymentStatus" | "trackingNo" | "courier" | "razorpayPaymentId" | "razorpayOrderId"
    >
  >,
) {
  const prisma = await getPrisma();
  if (prisma) {
    try {
      await prisma.order.update({ where: { id }, data: patch as any });
      return true;
    } catch {
      /* fall through */
    }
  }
  const demo = readDemo();
  demo.orders = demo.orders.map((o) => (o.id === id || o.orderNumber === id ? { ...o, ...patch } : o));
  writeDemo(demo);
  return true;
}

/* ───────────────────────────── enquiries ───────────────────────────── */

export async function createEnquiry(input: Omit<DemoEnquiry, "id" | "createdAt" | "status">) {
  const prisma = await getPrisma();
  if (prisma) {
    try {
      const created = await prisma.enquiry.create({
        data: {
          name: input.name,
          phone: input.phone,
          message: input.message,
          productSlug: input.productSlug,
          productName: input.productName,
          type: input.type,
        },
      });
      return { ...input, id: created.id, status: "NEW", createdAt: created.createdAt.toISOString() } as DemoEnquiry;
    } catch {
      /* fall through */
    }
  }
  const demo = readDemo();
  const created: DemoEnquiry = {
    ...input,
    id: `enq-${Date.now()}`,
    status: "NEW",
    createdAt: new Date().toISOString(),
  };
  demo.enquiries.unshift(created);
  writeDemo(demo);
  return created;
}

export async function listEnquiries() {
  const prisma = await getPrisma();
  if (prisma) {
    try {
      const rows = await prisma.enquiry.findMany({ orderBy: { createdAt: "desc" } });
      if (rows.length) {
        return rows.map((r: any) => ({
          id: r.id,
          name: r.name,
          phone: r.phone,
          message: r.message ?? "",
          productSlug: r.productSlug ?? undefined,
          productName: r.productName ?? undefined,
          type: r.type,
          status: r.status,
          createdAt: r.createdAt.toISOString(),
        })) as DemoEnquiry[];
      }
    } catch {
      /* fall through */
    }
  }
  return readDemo().enquiries;
}

export async function updateEnquiryStatus(id: string, status: DemoEnquiry["status"]) {
  const demo = readDemo();
  demo.enquiries = demo.enquiries.map((e) => (e.id === id ? { ...e, status } : e));
  writeDemo(demo);
  return true;
}

/* ───────────────────────────── admin stats ───────────────────────────── */

export async function getStats() {
  const orders = await listOrders();
  const revenue = orders
    .filter((o) => o.paymentStatus === "PAID")
    .reduce((sum, o) => sum + o.total, 0);
  const days: { label: string; value: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const day = new Date(Date.now() - i * 86400000);
    const key = day.toISOString().slice(0, 10);
    const value = orders
      .filter((o) => o.createdAt.slice(0, 10) === key)
      .reduce((s, o) => s + o.total, 0);
    days.push({ label: day.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }), value });
  }
  const metalOf = new Map(allCatalogProducts.map((p) => [p.slug, p.metal]));
  const byCategory = ["GOLD", "DIAMOND", "GEMSTONE", "SILVER"].map((metal) => ({
    label: metal,
    value: orders.reduce(
      (sum, o) =>
        sum +
        o.items
          .filter((it) => metalOf.get(it.slug) === metal)
          .reduce((s, it) => s + it.unitPrice * it.quantity, 0),
      0,
    ),
  }));
  const productSales = new Map<string, number>();
  for (const o of orders) {
    for (const it of o.items) {
      productSales.set(it.name, (productSales.get(it.name) ?? 0) + it.quantity);
    }
  }
  const top = [...productSales.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, value]) => ({ label, value }));

  return {
    revenue,
    orderCount: orders.length,
    pendingCount: orders.filter((o) => o.status === "PENDING").length,
    enquiryCount: (await listEnquiries()).length,
    days,
    byCategory,
    top,
  };
}

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
}

export async function listUsers(): Promise<AdminUserRow[]> {
  const prisma = await getPrisma();
  if (prisma) {
    try {
      const rows = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
      if (rows.length) {
        return rows.map((u: any) => ({
          id: u.id,
          name: u.name ?? "Guest",
          email: u.email ?? "",
          phone: u.phone ?? "",
          role: String(u.role),
          createdAt: u.createdAt.toISOString(),
        })) as AdminUserRow[];
      }
    } catch {
      /* fall through */
    }
  }
  return readDemo().users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone ?? "",
    role: u.role,
    createdAt: u.createdAt,
  }));
}

export async function getProductsForAdmin() {
  const { products } = await listProducts();
  return products;
}

export { rateKey };
