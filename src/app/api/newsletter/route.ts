import { z } from "zod";
import { fail, ok, rateLimit, clientIp } from "@/lib/api";
import { createEnquiry } from "@/lib/repo";

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  const limiter = rateLimit(`news:${clientIp(req)}`, 5, 10 * 60_000);
  if (!limiter.allowed) return fail("Too many requests", 429);

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail("Enter a valid email", 422);

  await createEnquiry({
    name: "Newsletter subscriber",
    phone: "0000000000",
    message: parsed.data.email,
    type: "NEWSLETTER",
  });
  return ok({ subscribed: true });
}
