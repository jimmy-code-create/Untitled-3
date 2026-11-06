import test from "node:test";
import assert from "node:assert/strict";
import { computeBreakup, GST_RATE } from "../src/lib/pricing";
import { convertSpotToRates, exceedsGuard, TROY_OUNCE_GRAMS } from "../src/lib/rates";
import { createPriceLock, verifyPriceLock } from "../src/lib/price-lock";
import type { SpotRates } from "../src/lib/rates";
import type { RateConfig } from "../src/lib/settings";

const config: RateConfig = {
  provider: "metals-api",
  useLiveFeed: { gold: true, silver: true },
  importDutyPct: 6,
  premiumPerGram: 100,
  shopRulePerGram: 0,
};

const spot: SpotRates = {
  xauUsdOz: 2000,
  xagUsdOz: 25,
  usdInr: 83,
  fetchedAt: new Date().toISOString(),
  source: "test",
};

test("ounce to gram conversion with duty and premium", () => {
  const rates = convertSpotToRates(spot, config);
  const pure = (2000 * 83 * 1.06) / TROY_OUNCE_GRAMS + 100;
  assert.equal(rates["24K"], Math.round(pure));
  assert.equal(rates["22K"], Math.round(pure * 0.916));
  assert.equal(rates["18K"], Math.round(pure * 0.75));
});

test("silver purity factors", () => {
  const rates = convertSpotToRates(spot, config);
  const pure = (25 * 83 * 1.06) / TROY_OUNCE_GRAMS + 100;
  assert.equal(rates.SILVER_999, Math.round(pure));
  assert.equal(rates.SILVER_925, Math.round(pure * 0.925));
});

test("3% sanity guard rejects larger moves", () => {
  assert.equal(exceedsGuard(1000, 1029), false);
  assert.equal(exceedsGuard(1000, 1031), true);
  assert.equal(exceedsGuard(1000, 970), false);
  assert.equal(exceedsGuard(1000, 969), true);
  assert.equal(exceedsGuard(0, 5000), false);
});

test("price function adds 3% GST and making charges", () => {
  const breakup = computeBreakup(
    { metal: "GOLD", purity: "22K", weight: 10, gemstoneValue: 5000, makingPct: 12 },
    { "22K": 7000 },
  );
  assert.equal(breakup.metalValue, 70000);
  assert.equal(breakup.makingCharges, 8400);
  assert.equal(breakup.gst, Math.round((70000 + 5000 + 8400) * GST_RATE));
  assert.equal(breakup.total, breakup.subtotal + breakup.gst);
});

test("signed price lock survives verification and expires", () => {
  const lock = createPriceLock({ "22K": 7000 }, "snap-1", 15);
  const verified = verifyPriceLock(lock.token);
  assert.ok(verified);
  assert.equal(verified?.rates["22K"], 7000);
  assert.equal(verified?.snapshotId, "snap-1");
  assert.ok((verified?.lockedUntil ?? 0) > Date.now());

  const expired = createPriceLock({ "22K": 7000 }, "snap-2", -1);
  const old = verifyPriceLock(expired.token);
  assert.ok(old);
  assert.ok((old?.lockedUntil ?? 0) < Date.now());
});

test("tampered price lock is rejected", () => {
  const lock = createPriceLock({ "22K": 7000 }, "snap-1", 15);
  const [body] = lock.token.split(".");
  const forged = `${body}.not-a-signature`;
  assert.equal(verifyPriceLock(forged), null);
});
