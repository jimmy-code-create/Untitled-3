import { fail, ok, requireAdmin } from "@/lib/api";
import { deleteProduct, getProduct, saveProduct } from "@/lib/repo";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return fail("Product not found", 404);
  return ok({ product });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorised", 401);

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return fail("Invalid payload", 422);
  await saveProduct({ ...body, slug });
  return ok({ slug });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorised", 401);
  await deleteProduct(slug);
  return ok({ deleted: slug });
}
