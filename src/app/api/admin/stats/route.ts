import { fail, ok, requireAdmin } from "@/lib/api";
import { getStats } from "@/lib/repo";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorised", 401);
  return ok({ stats: await getStats() });
}
