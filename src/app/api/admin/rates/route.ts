import { z } from "zod";
import { fail, ok, requireAdmin } from "@/lib/api";
import {
  clearRateCache,
  getRateCards,
  getHistorySeries,
  listAudit,
  publishManualRates,
  publishPendingRate,
  refreshRates,
  saveRateConfig,
} from "@/lib/rates";
import { getSettings } from "@/lib/repo";

export const dynamic = "force-dynamic";

const configSchema = z.object({
  provider: z.enum(["manual", "metals-api"]),
  useLiveFeed: z.object({ gold: z.boolean(), silver: z.boolean() }),
  importDutyPct: z.number().min(0).max(100),
  premiumPerGram: z.number().min(0).max(100_000),
  shopRulePerGram: z.number().min(-100_000).max(100_000),
});

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("refresh") }),
  z.object({ action: z.literal("publish"), purity: z.enum(["24K", "22K", "18K", "SILVER_925", "SILVER_999"]) }),
  z.object({
    action: z.literal("manual"),
    updates: z
      .array(
        z.object({
          purity: z.enum(["24K", "22K", "18K", "SILVER_925", "SILVER_999"]),
          ratePerGram: z.number().int().positive().max(1_000_000),
        }),
      )
      .min(1),
  }),
  z.object({ action: z.literal("config"), config: configSchema }),
]);

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorised", 401);
  const [cards, settings, history, audit] = await Promise.all([
    getRateCards(),
    getSettings(),
    getHistorySeries(30),
    listAudit(50),
  ]);
  return ok({ cards, config: settings.rateConfig, history, audit, liveConfigured: Boolean(process.env.METAL_API_KEY) });
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorised", 401);
  const actor = admin.user?.email ?? "admin";

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail("Invalid rate action", 422);

  try {
    if (parsed.data.action === "refresh") {
      const result = await refreshRates(actor);
      clearRateCache();
      return ok({ result });
    }
    if (parsed.data.action === "publish") {
      const result = await publishPendingRate(parsed.data.purity, actor);
      return result.ok ? ok({ result }) : fail(result.reason ?? "Nothing to publish", 409);
    }
    if (parsed.data.action === "manual") {
      await publishManualRates(parsed.data.updates, actor);
      return ok({ updated: parsed.data.updates.length });
    }
    await saveRateConfig(parsed.data.config, actor);
    return ok({ config: parsed.data.config });
  } catch (error) {
    return fail((error as Error).message || "Rate action failed", 502);
  }
}
