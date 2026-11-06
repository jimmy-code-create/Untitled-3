import crypto from "crypto";
import { z } from "zod";
import { fail, ok } from "@/lib/api";
import { getOrder, updateOrder } from "@/lib/repo";

const schema = z.object({
  orderId: z.string(),
  razorpay_order_id: z.string().optional(),
  razorpay_payment_id: z.string().optional(),
  razorpay_signature: z.string().optional(),
  demo: z.boolean().optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail("Invalid payment payload", 422);

  const order = await getOrder(parsed.data.orderId);
  if (!order) return fail("Order not found", 404);

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  let verified = false;

  if (parsed.data.demo && !keySecret) {
    verified = process.env.DEMO_MODE !== "false";
  } else if (keySecret && parsed.data.razorpay_order_id && parsed.data.razorpay_payment_id && parsed.data.razorpay_signature) {
    const expected = crypto
      .createHmac("sha256", keySecret)
      .update(`${parsed.data.razorpay_order_id}|${parsed.data.razorpay_payment_id}`)
      .digest("hex");
    verified = expected === parsed.data.razorpay_signature;
  }

  if (!verified) {
    await updateOrder(order.id, { paymentStatus: "FAILED" });
    return fail("Payment verification failed", 400);
  }

  await updateOrder(order.id, {
    paymentStatus: "PAID",
    status: "CONFIRMED",
    razorpayPaymentId: parsed.data.razorpay_payment_id ?? "demo_payment",
  });

  return ok({ orderNumber: order.orderNumber, status: "PAID" });
}
