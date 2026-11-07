import { z } from "zod";
import { fail, ok, requireAdmin, rateLimit, clientIp } from "@/lib/api";
import { getPublicRates, publishManualRates } from "@/lib/rates";
import { RATE_PROVIDER } from "@/lib/rate-provider-config";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const limiter = rateLimit(`rates:${clientIp(req)}`, 120, 60_000);
  if (!limiter.allowed) return fail("Too many requests", 429, { retryAfter: limiter.retryAfter });

  const data = await getPublicRates();
  return ok(
    { ...data },
    {
      headers: {
        // Matches the 3-minute upstream cache: every visitor shares one value.
        "Cache-Control": `public, s-maxage=${RATE_PROVIDER.cache.proxySMaxAge}, stale-while-revalidate=300`,
      },
    },
  );
}

const schema = z.object({
  updates: z
    .array(
      z.object({
        purity: z.enum(["24K", "22K", "18K", "SILVER_925", "SILVER_999"]),
        ratePerGram: z.number().int().positive().max(1_000_000),
      }),
    )
    .min(1),
});

export async function PUT(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorised", 401);

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail("Invalid rate payload", 422);

  await publishManualRates(parsed.data.updates, admin.user?.email ?? "admin");
  return ok({ updated: parsed.data.updates.length });
}
