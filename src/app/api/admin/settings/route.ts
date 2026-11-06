import { z } from "zod";
import { fail, ok, requireAdmin } from "@/lib/api";
import { getSettings, updateSettings } from "@/lib/repo";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorised", 401);
  return ok({ settings: await getSettings() });
}

const schema = z.object({
  festivalMode: z.boolean().optional(),
  announcementText: z.string().min(1).max(120).optional(),
  offerHeadline: z.string().min(1).max(40).optional(),
  offerSub: z.string().min(1).max(60).optional(),
  giftStartingPrice: z.string().max(40).nullable().optional(),
  exchangeNote: z.string().max(140).nullable().optional(),
  popupText: z.string().max(200).nullable().optional(),
  popupEnabled: z.boolean().optional(),
  assurance: z
    .object({
      purity: z.boolean(),
      exchange: z.boolean(),
      replacement: z.boolean(),
      maintenance: z.boolean(),
    })
    .optional(),
  socials: z
    .object({
      instagram: z.string().max(200),
      facebook: z.string().max(200),
      youtube: z.string().max(200),
    })
    .optional(),
});

export async function PATCH(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorised", 401);

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail("Invalid settings payload", 422);

  const settings = await updateSettings(parsed.data);
  return ok({ settings });
}
