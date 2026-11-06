import { z } from "zod";
import { fail, ok, rateLimit, clientIp } from "@/lib/api";
import { isDemo, sendOtp } from "@/lib/otp";

const schema = z.object({ phone: z.string().min(10).max(14) });

export async function POST(req: Request) {
  const limiter = rateLimit(`otp:${clientIp(req)}`, 6, 10 * 60_000);
  if (!limiter.allowed) return fail("Too many OTP requests. Please try again in a few minutes.", 429);

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail("Enter a valid 10-digit mobile number");

  try {
    const { phone, code, ttlSeconds } = sendOtp(parsed.data.phone);
    // In demo mode the code is returned so the flow can be tested without SMS.
    return ok({ phone, ttlSeconds, ...(isDemo() ? { devCode: code } : {}) });
  } catch (error) {
    return fail((error as Error).message);
  }
}
