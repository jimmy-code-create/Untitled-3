import { z } from "zod";
import crypto from "crypto";
import { fail, ok } from "@/lib/api";
import { getOrder, updateOrder } from "@/lib/repo";

const schema = z.object({ orderId: z.string().min(3) });

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail("Invalid order", 422);

  const order = await getOrder(parsed.data.orderId);
  if (!order) return fail("Order not found", 404);
  if (order.paymentStatus === "PAID") return fail("Order already paid", 409);

  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return ok({
      demo: true,
      keyId: null,
      razorpayOrderId: `demo_${crypto.randomBytes(8).toString("hex")}`,
      amount: order.total * 100,
      currency: "INR",
      orderNumber: order.orderNumber,
    });
  }

  try {
    const Razorpay = (await import("razorpay")).default;
    const client = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const created = await client.orders.create({
      amount: Math.round(order.total * 100),
      currency: "INR",
      receipt: order.orderNumber,
      notes: { orderId: order.id, orderNumber: order.orderNumber },
    });
    await updateOrder(order.id, { razorpayOrderId: created.id });
    return ok({
      demo: false,
      keyId,
      razorpayOrderId: created.id,
      amount: created.amount,
      currency: created.currency,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    return fail(`Could not start payment: ${(error as Error).message}`, 502);
  }
}
