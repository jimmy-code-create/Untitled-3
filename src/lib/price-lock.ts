/**
 * Signed 15-minute price lock. The server embeds the rate snapshot in a short
 * HMAC token; checkout can honour it even if a new rate is published. No DB
 * round-trip and no client-controlled price.
 */

import crypto from "crypto";
import type { RateMap } from "./pricing";

export const PRICE_LOCK_MINUTES = 15;

export interface PriceLockPayload {
  rates: RateMap;
  snapshotId: string;
  lockedUntil: number;
}

function secret() {
  return process.env.NEXTAUTH_SECRET || "jmd-dev-price-lock-secret-change-me";
}

function sign(body: string) {
  return crypto.createHmac("sha256", secret()).update(body).digest("base64url");
}

export function createPriceLock(rates: RateMap, snapshotId: string, minutes = PRICE_LOCK_MINUTES) {
  const payload: PriceLockPayload = {
    rates,
    snapshotId,
    lockedUntil: Date.now() + minutes * 60_000,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return { token: `${body}.${sign(body)}`, lockedUntil: payload.lockedUntil, snapshotId };
}

export function verifyPriceLock(token: string | undefined | null): PriceLockPayload | null {
  if (!token || !token.includes(".")) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expected = sign(body);
  if (
    signature.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  ) {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as PriceLockPayload;
    if (!payload || typeof payload.lockedUntil !== "number" || !payload.rates) return null;
    return payload;
  } catch {
    return null;
  }
}
