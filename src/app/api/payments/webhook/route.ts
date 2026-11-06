import crypto from "crypto";
import { fail, ok } from "@/lib/api";
import { listOrders, updateOrder } from "@/lib/repo";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return fail("Webhook not configured", 503);

  const raw = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";
  const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");

  if (expected !== signature) return fail("Invalid signature", 401);

  let payload: any;
  try {
    payload = JSON.parse(raw);
  } catch {
    return fail("Invalid JSON", 400);
  }

  const entity = payload?.payload?.payment?.entity ?? payload?.payload?.order?.entity;
  const razorpayOrderId = entity?.order_id ?? entity?.id;
  const paymentId = payload?.payload?.payment?.entity?.id;

  if (!razorpayOrderId) return ok({ ignored: true });

  const orders = await listOrders();
  const order = orders.find((o) => o.razorpayOrderId === razorpayOrderId);
  if (!order) return ok({ ignored: true, reason: "unknown order" });

  const event = payload.event as string;
  if (event === "payment.captured" || event === "order.paid") {
    await updateOrder(order.id, { paymentStatus: "PAID", status: "CONFIRMED", razorpayPaymentId: paymentId });
  } else if (event === "payment.failed") {
    await updateOrder(order.id, { paymentStatus: "FAILED" });
  }

  return ok({ received: true, event });
}
