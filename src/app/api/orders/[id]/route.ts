import { z } from "zod";
import { fail, ok, requireAdmin } from "@/lib/api";
import { getOrder, updateOrder } from "@/lib/repo";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorised", 401);
  const order = await getOrder(id);
  if (!order) return fail("Order not found", 404);
  return ok({ order });
}

const schema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PACKED", "SHIPPED", "READY_FOR_PICKUP", "DELIVERED", "CANCELLED"]).optional(),
  paymentStatus: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]).optional(),
  trackingNo: z.string().max(60).optional(),
  courier: z.string().max(60).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorised", 401);

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail("Invalid status payload", 422);

  await updateOrder(id, parsed.data);
  return ok({ id, ...parsed.data });
}
