import { z } from "zod";

/**
 * Environment contract. Optional integrations are validated for shape rather
 * than presence so the site runs without keys (demo rates, WhatsApp orders),
 * but a malformed value fails at startup instead of at the checkout.
 */
const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(16).optional(),
  DATABASE_URL: z.string().min(1).optional(),
  RAZORPAY_KEY_ID: z.string().min(1).optional(),
  RAZORPAY_KEY_SECRET: z.string().min(1).optional(),
  CLOUDINARY_CLOUD_NAME: z.string().min(1).optional(),
  CLOUDINARY_API_KEY: z.string().min(1).optional(),
  CLOUDINARY_API_SECRET: z.string().min(1).optional(),
  METAL_API_KEY: z.string().min(1).optional(),
  METAL_API_URL: z.string().url().optional(),
  GOLDPRICEZ_API_KEY: z.string().min(1).optional(),
  /** Used only when the free forex API is unreachable. */
  USD_INR_FALLBACK: z.coerce.number().positive().optional(),
  CRON_SECRET: z.string().min(1).optional(),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const detail = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
  throw new Error(`Invalid environment configuration — ${detail}`);
}

export const env = parsed.data;

/** Integrations that are wired in code but need the owner's keys. */
export const missingIntegrations = {
  payments: !(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET),
  uploads: !(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET),
  authSecret: !env.NEXTAUTH_SECRET,
  database: !env.DATABASE_URL,
  liveRates: !env.GOLDPRICEZ_API_KEY,
} as const;
