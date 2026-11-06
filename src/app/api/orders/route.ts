import { z } from "zod";
import { fail, ok, rateLimit, clientIp, getSessionUser } from "@/lib/api";
import { createOrder, getProduct, listOrders } from "@/lib/repo";
import { computeBreakup, shippingFor } from "@/lib/pricing";
import { getPublicRates } from "@/lib/rates";
import { verifyPriceLock } from "@/lib/price-lock";

export const dynamic = "force-dynamic";

const schema = z.object({
  items: z
    .array(z.object({ slug: z.string(), size: z.string().optional(), quantity: z.number().int().min(1).max(5) }))
    .min(1)
    .max(20),
  customer: z.object({
    name: z.string().min(2),
    phone: z.string().regex(/^\d{10}$/),
    email: z.string().email(),
  }),
  address: z.object({
    line1: z.string().min(3),
    line2: z.string().optional(),
    city: z.string().min(2),
    state: z.string().min(2),
    pincode: z.string().regex(/^\d{6}$/),
  }),
  fulfillment: z.enum(["DELIVERY", "PICKUP"]),
  paymentMethod: z.enum(["ONLINE", "STORE"]),
  lockToken: z.string().max(4000).optional(),
  notes: z.string().max(500).optional(),
});

export async function POST(req: Request) {
  const limiter = rateLimit(`orders:${clientIp(req)}`, 8, 60_000);
  if (!limiter.allowed) return fail("Too many attempts. Please wait a minute.", 429);

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid order", 422);

  const session = await getSessionUser();
  const publicRates = await getPublicRates();
  const lock = verifyPriceLock(parsed.data.lockToken);
  const lockValid = Boolean(lock && lock.lockedUntil > Date.now());
  const rates = lockValid && lock ? lock.rates : publicRates.rates;
  const rateSnapshotId = lockValid && lock ? lock.snapshotId : publicRates.snapshotId;
  const rateSnapshot = {
    rates,
    source: lockValid ? "price-lock" : publicRates.source,
    status: publicRates.status,
    pricedAt: publicRates.updatedAt,
  };

  const items = [];
  let subtotal = 0;
  let gst = 0;
  for (const item of parsed.data.items) {
    const product = await getProduct(item.slug);
    if (!product) return fail(`Product unavailable: ${item.slug}`, 404);
    if (product.stock <= 0) return fail(`${product.name} is currently made to order — please enquire on WhatsApp`, 409);

    const breakup = computeBreakup(
      {
        metal: product.metal,
        purity: product.purity,
        weight: product.weight,
        gemstoneValue: product.gemstoneValue,
        makingPct: product.makingPct,
        quantity: item.quantity,
      },
      rates,
    );

    subtotal += breakup.subtotal;
    gst += breakup.gst;
    items.push({
      slug: product.slug,
      name: product.name,
      image: product.images[0],
      size: item.size ?? product.sizes[0],
      quantity: item.quantity,
      unitPrice: Math.round(breakup.total / item.quantity),
      metalWeight: product.weight,
      gemstoneValue: product.gemstoneValue,
      makingCharges: breakup.makingCharges,
      gst: breakup.gst,
      ratePerGram: breakup.ratePerGram,
      goldValue: breakup.metalValue,
      priceBreakup: breakup,
    });
  }

  const shipping = parsed.data.fulfillment === "PICKUP" ? 0 : shippingFor(subtotal);
  const total = subtotal + gst + shipping;
  const goldRate = rates["22K"] ?? 0;

  const order = await createOrder({
    email: parsed.data.customer.email,
    phone: parsed.data.customer.phone,
    customerName: parsed.data.customer.name,
    status: "PENDING",
    paymentStatus: "PENDING",
    paymentMethod: parsed.data.paymentMethod,
    fulfillment: parsed.data.fulfillment,
    subtotal,
    gst,
    shipping,
    total,
    goldRate,
    rateSnapshot,
    rateSnapshotId,
    priceBreakup: items.map((i) => ({
      slug: i.slug,
      quantity: i.quantity,
      ratePerGram: i.ratePerGram,
      goldValue: i.goldValue,
      gemstoneValue: i.gemstoneValue,
      makingCharges: i.makingCharges,
      gst: i.gst,
      total: i.unitPrice * i.quantity,
    })),
    priceLockedUntil: lockValid && lock ? new Date(lock.lockedUntil).toISOString() : undefined,
    address: {
      fullName: parsed.data.customer.name,
      phone: parsed.data.customer.phone,
      line1: parsed.data.address.line1,
      line2: parsed.data.address.line2 ?? "",
      city: parsed.data.address.city,
      state: parsed.data.address.state,
      pincode: parsed.data.address.pincode,
    },
    items,
    notes: parsed.data.notes,
  });

  return ok({
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      total: order.total,
      fulfillment: order.fulfillment,
      paymentMethod: order.paymentMethod,
    },
    requiresPayment: parsed.data.paymentMethod === "ONLINE",
    priceLocked: lockValid,
    repriced: Boolean(parsed.data.lockToken && !lockValid),
    lockedUntil: lockValid && lock ? new Date(lock.lockedUntil).toISOString() : null,
    user: session?.user?.email ?? null,
  });
}

export async function GET() {
  const session = await getSessionUser();
  if (!session?.user) return fail("Sign in to view orders", 401);
  const orders =
    session.user.role === "ADMIN" ? await listOrders() : await listOrders(session.user.email ?? undefined);
  return ok({ orders });
}
