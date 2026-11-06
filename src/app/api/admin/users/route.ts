import { fail, ok, requireAdmin } from "@/lib/api";
import { listUsers } from "@/lib/repo";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorised", 401);
  return ok({ users: await listUsers() });
}
