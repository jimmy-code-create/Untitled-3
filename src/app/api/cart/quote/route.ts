import { z } from "zod";
import { fail, ok, rateLimit, clientIp } from "@/lib/api";
import { getProduct } from "@/lib/repo";
import { computeBreakup, shippingFor } from "@/lib/pricing";
import { getPublicRates } from "@/lib/rates";
import { createPriceLock, PRICE_LOCK_MINUTES } from "@/lib/price-lock";

const schema = z.object({
  items: z.array(z.object({ slug: z.string(), quantity: z.number().int().min(1).max(5) })).max(20),
});

export async function POST(req: Request) {
  const limiter = rateLimit(`quote:${clientIp(req)}`, 60, 60_000);
  if (!limiter.allowed) return fail("Too many requests", 429);

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail("Invalid cart", 422);

  const publicRates = await getPublicRates();
  const rates = publicRates.rates;
  const lock = createPriceLock(rates, publicRates.snapshotId);
  const lines = [];
  let subtotal = 0;
  let gst = 0;

  for (const item of parsed.data.items) {
    const product = await getProduct(item.slug);
    if (!product) continue;
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
    lines.push({
      slug: product.slug,
      name: product.name,
      image: product.images[0],
      price: breakup.total / item.quantity,
      unitTotal: breakup.total / item.quantity,
      lineTotal: breakup.total,
      quantity: item.quantity,
      metalWeight: product.weight,
      gemstoneValue: product.gemstoneValue,
      makingCharges: breakup.makingCharges,
      gst: breakup.gst,
      breakup,
    });
  }

  const shipping = shippingFor(subtotal);
  return ok({
    lines,
    subtotal,
    gst,
    shipping,
    total: subtotal + gst + shipping,
    rates,
    lockToken: lock.token,
    lockedUntil: lock.lockedUntil,
    lockMinutes: PRICE_LOCK_MINUTES,
    snapshotId: publicRates.snapshotId,
    rateStatus: publicRates.status,
    staleLabel: publicRates.staleLabel,
    pricedAt: publicRates.updatedAt,
  });
}
