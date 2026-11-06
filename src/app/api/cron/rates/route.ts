import { fail, ok, requireAdmin } from "@/lib/api";
import { refreshRates } from "@/lib/rates";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * Cron entry point — configure in vercel.json every 5 minutes.
 * Vercel sends `Authorization: Bearer $CRON_SECRET`; admins can also trigger it.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const isCron = Boolean(secret && bearer && bearer === secret);
  const admin = isCron ? null : await requireAdmin();

  if (!isCron && !admin) return fail("Unauthorised", 401);

  try {
    const result = await refreshRates("cron");
    return ok({ result });
  } catch (error) {
    return fail((error as Error).message || "Rate refresh failed", 502);
  }
}

export async function POST(req: Request) {
  return GET(req);
}
