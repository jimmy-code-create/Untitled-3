/**
 * Phone OTP store.
 *
 * Development/demo: codes live in process memory and are echoed back by
 * /api/auth/otp when `DEMO_MODE` is not "false", so the flow can be tested
 * without an SMS provider. Wire an SMS gateway (MSG91 / Twilio) in
 * `sendOtp` before going live.
 */

interface OtpRecord {
  code: string;
  expiresAt: number;
  attempts: number;
}

const store = new Map<string, OtpRecord>();
const TTL_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export function normalisePhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  return digits.length > 10 ? digits.slice(-10) : digits;
}

export function isDemo() {
  return process.env.DEMO_MODE !== "false";
}

export function sendOtp(rawPhone: string) {
  const phone = normalisePhone(rawPhone);
  if (phone.length !== 10) throw new Error("Enter a valid 10-digit mobile number");
  const code = String(Math.floor(100000 + Math.random() * 900000));
  store.set(phone, { code, expiresAt: Date.now() + TTL_MS, attempts: 0 });
  // eslint-disable-next-line no-console
  console.log(`[JMD OTP] ${phone} → ${code}`);
  return { phone, code, ttlSeconds: TTL_MS / 1000 };
}

export function verifyOtp(rawPhone: string, code: string) {
  const phone = normalisePhone(rawPhone);
  const record = store.get(phone);
  if (!record) return { ok: false, reason: "No OTP requested for this number" };
  if (Date.now() > record.expiresAt) {
    store.delete(phone);
    return { ok: false, reason: "OTP expired, please request a new one" };
  }
  if (record.attempts >= MAX_ATTEMPTS) {
    store.delete(phone);
    return { ok: false, reason: "Too many attempts, request a new OTP" };
  }
  record.attempts += 1;
  if (record.code !== code.trim()) return { ok: false, reason: "Incorrect OTP" };
  store.delete(phone);
  return { ok: true, reason: "" };
}
