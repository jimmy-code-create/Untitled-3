import { z } from "zod";
import { fail, ok, rateLimit, clientIp, requireAdmin } from "@/lib/api";
import { createEnquiry, getProduct, listEnquiries, updateEnquiryStatus } from "@/lib/repo";

export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().min(2).max(80),
  phone: z.string().regex(/^\d{10}$/),
  message: z.string().max(600).optional(),
  productSlug: z.string().optional(),
  type: z.enum(["PRODUCT", "STORE_VISIT", "GENERAL", "OLD_GOLD"]).default("GENERAL"),
});

export async function POST(req: Request) {
  const limiter = rateLimit(`enquiry:${clientIp(req)}`, 6, 10 * 60_000);
  if (!limiter.allowed) return fail("Too many enquiries. Please call us instead.", 429);

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid enquiry", 422);

  let productName: string | undefined;
  if (parsed.data.productSlug) {
    const product = await getProduct(parsed.data.productSlug);
    productName = product?.name;
  }

  const enquiry = await createEnquiry({ ...parsed.data, productName });
  return ok({ enquiry: { id: enquiry.id } });
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorised", 401);
  return ok({ enquiries: await listEnquiries() });
}

export async function PATCH(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorised", 401);
  const body = await req.json().catch(() => null);
  const parsed = z
    .object({ id: z.string(), status: z.enum(["NEW", "CONTACTED", "CLOSED"]) })
    .safeParse(body);
  if (!parsed.success) return fail("Invalid payload", 422);
  await updateEnquiryStatus(parsed.data.id, parsed.data.status);
  return ok({ id: parsed.data.id });
}
