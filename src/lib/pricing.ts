/**
 * Pricing engine — the single source of truth for money.
 * price = (metal weight × live rate for purity) + gemstone value + making charges + 3% GST
 * Always executed server side; the client never sends a price.
 */

export const GST_RATE = 0.03;
export const FREE_SHIPPING_THRESHOLD = 25_000;

export type MetalKind = "GOLD" | "SILVER" | "DIAMOND" | "GEMSTONE";
export type RateMap = Record<string, number>;

export const DEFAULT_RATES: RateMap = {
  "24K": 7470,
  "22K": 6850,
  "18K": 5610,
  SILVER_925: 92,
  SILVER_999: 99,
};

export const RATE_LABELS: Record<string, string> = {
  "24K": "24K Gold",
  "22K": "22K Gold",
  "18K": "18K Gold",
  SILVER_925: "Silver 92.5",
  SILVER_999: "Silver 99.9",
};

export function rateKey(metal: MetalKind | string, purity: string): string {
  if (metal === "SILVER") return `SILVER_${purity.replace(".", "")}`;
  return purity;
}

export function unitFor(metal: MetalKind | string): "g" | "kg" {
  return metal === "SILVER" ? "kg" : "g";
}

export interface PricingInput {
  metal: MetalKind | string;
  purity: string;
  weight: number;
  gemstoneValue: number;
  makingPct: number;
  quantity?: number;
}

export interface PriceBreakup {
  metalValue: number;
  ratePerGram: number;
  gemstoneValue: number;
  makingCharges: number;
  subtotal: number;
  gst: number;
  total: number;
  quantity: number;
  weight: number;
}

const round = (n: number) => Math.round(n);

export function computeBreakup(input: PricingInput, rates: RateMap = DEFAULT_RATES): PriceBreakup {
  const quantity = Math.max(1, Math.floor(input.quantity ?? 1));
  const ratePerGram = rates[rateKey(input.metal, input.purity)] ?? rates["22K"] ?? 0;
  const metalValue = round(input.weight * ratePerGram);
  const makingCharges = round((metalValue * input.makingPct) / 100);
  const gemstoneValue = round(input.gemstoneValue);
  const subtotal = (metalValue + gemstoneValue + makingCharges) * quantity;
  const gst = round(subtotal * GST_RATE);
  return {
    metalValue,
    ratePerGram,
    gemstoneValue,
    makingCharges,
    subtotal,
    gst,
    total: subtotal + gst,
    quantity,
    weight: input.weight,
  };
}

export function priceOf(input: PricingInput, rates: RateMap = DEFAULT_RATES): number {
  return computeBreakup(input, rates).total;
}

export function shippingFor(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 0;
}

export function inr(value: number, withPaise = false): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: withPaise ? 2 : 0,
    maximumFractionDigits: withPaise ? 2 : 0,
  }).format(value);
}

export function compactInr(value: number): string {
  if (value >= 10_000_000) return `₹${(value / 10_000_000).toFixed(2)} Cr`;
  if (value >= 100_000) return `₹${(value / 100_000).toFixed(2)} L`;
  if (value >= 1_000) return `₹${Math.round(value / 1_000)}K`;
  return `₹${value}`;
}

/** Indicative old-price anchor for offer badges (~18% above). */
export function mrpOf(total: number): number {
  return round((total * 1.18) / 100) * 100;
}
