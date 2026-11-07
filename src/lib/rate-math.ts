/**
 * Pure rate maths — no imports, usable from server or client.
 *
 * spot (USD per troy ounce) × USD/INR ÷ 31.1035 = INR per gram, then karat
 * factors and the owner's India adjustment.
 */

export const TROY_OUNCE_GRAMS = 31.1035;
export const SANITY_GUARD = 0.03; // max 3% movement before owner approval

const KARAT_FACTOR: Record<string, number> = {
  "24K": 1,
  "22K": 0.916,
  "18K": 0.75,
  SILVER_999: 1,
  SILVER_925: 0.925,
};

export interface SpotLike {
  xauUsdOz: number;
  xagUsdOz: number;
  usdInr: number;
}

export interface RateConfigLike {
  importDutyPct: number;
  premiumPerGram: number;
}

/** Spot snapshot → shop rate per gram for every purity we sell. */
export function convertSpotToRates(spot: SpotLike, config: RateConfigLike): Record<string, number> {
  const duty = 1 + config.importDutyPct / 100;
  const premium = config.premiumPerGram;
  const goldPure = (spot.xauUsdOz * spot.usdInr * duty) / TROY_OUNCE_GRAMS + premium;
  const silverPure = (spot.xagUsdOz * spot.usdInr * duty) / TROY_OUNCE_GRAMS + premium;

  return {
    "24K": Math.round(goldPure),
    "22K": Math.round(goldPure * 0.916),
    "18K": Math.round(goldPure * 0.75),
    SILVER_999: Math.round(silverPure),
    SILVER_925: Math.round(silverPure * 0.925),
  };
}

export function purityFactor(purity: string): number {
  return KARAT_FACTOR[purity] ?? 1;
}

export function exceedsGuard(previous: number, next: number, threshold = SANITY_GUARD) {
  if (!(previous > 0)) return false;
  return Math.abs(next - previous) / previous > threshold;
}
