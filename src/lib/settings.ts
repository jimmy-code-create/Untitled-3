/**
 * Owner-editable storefront settings. Every customer-facing claim, offer and
 * number in the restyle is read from here and can be changed in /admin/settings.
 * Anything not confirmed by the shop renders as [CONFIRM WITH SHOP] instead of
 * being invented.
 */

export interface RateConfig {
  /**
   * Provider (see src/lib/rate-provider-config.ts for endpoints and TTLs):
   *  - "goldpricez"  → Goldpricez gold + silver spot (needs GOLDPRICEZ_API_KEY)
   *  - "manual"      → only the owner's rates (no network calls)
   *  - "free"        → keyless market feed (Yahoo Finance + Frankfurter FX)
   *  - "metals-api"  → Metals-API spot feed (needs METAL_API_KEY)
   */
  provider: "goldpricez" | "manual" | "free" | "metals-api";
  useLiveFeed: { gold: boolean; silver: boolean };
  /** India adjustment — configured by the owner, never hard-coded. */
  importDutyPct: number;
  premiumPerGram: number;
  /** Optional: shop rate = feed rate + this many rupees per gram. */
  shopRulePerGram: number;
}

export interface AssuranceSettings {
  purity: boolean;
  exchange: boolean;
  replacement: boolean;
  maintenance: boolean;
}

export interface SocialSettings {
  instagram: string;
  facebook: string;
  youtube: string;
}

export interface ShopSettings {
  festivalMode: boolean;
  announcementText: string;
  offerHeadline: string;
  offerSub: string;
  giftStartingPrice: string | null;
  exchangeNote: string | null;
  popupText: string | null;
  popupEnabled: boolean;
  assurance: AssuranceSettings;
  socials: SocialSettings;
  rateConfig: RateConfig;
}

export const DEFAULT_SETTINGS: ShopSettings = {
  festivalMode: false,
  // A greeting, not a claim. The owner can replace it in admin.
  announcementText: "Namaste, welcome to JMD Gems & Jewellery",
  offerHeadline: "[OFFER]",
  offerSub: "on your first order",
  giftStartingPrice: null,
  exchangeNote: null,
  popupText: null,
  popupEnabled: true,
  assurance: {
    // BIS hallmarking of gold jewellery is mandatory in India; the other
    // assurances are shop policies and stay hidden until toggled in admin.
    purity: true,
    exchange: false,
    replacement: false,
    maintenance: false,
  },
  socials: { instagram: "", facebook: "", youtube: "" },
  rateConfig: {
    provider: "goldpricez",
    useLiveFeed: { gold: true, silver: true },
    importDutyPct: 0,
    premiumPerGram: 0,
    shopRulePerGram: 0,
  },
};

const RATE_PROVIDERS: RateConfig["provider"][] = ["goldpricez", "manual", "free", "metals-api"];

const bool = (v: unknown, fallback: boolean) => (typeof v === "boolean" ? v : fallback);
const num = (v: unknown, fallback: number) =>
  typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : fallback;
const str = (v: unknown, fallback: string) => (typeof v === "string" ? v : fallback);
const nullableStr = (v: unknown): string | null =>
  typeof v === "string" && v.trim() ? v.trim() : null;

/** Merge an untrusted JSON blob from the database into the typed contract. */
export function mergeSettings(raw: unknown): ShopSettings {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, any>;
  const assurance = (r.assurance ?? {}) as Record<string, unknown>;
  const socials = (r.socials ?? {}) as Record<string, unknown>;
  const rate = (r.rateConfig ?? {}) as Record<string, any>;
  const live = (rate.useLiveFeed ?? {}) as Record<string, unknown>;

  return {
    festivalMode: bool(r.festivalMode, DEFAULT_SETTINGS.festivalMode),
    announcementText: str(r.announcementText, DEFAULT_SETTINGS.announcementText),
    offerHeadline: str(r.offerHeadline, DEFAULT_SETTINGS.offerHeadline),
    offerSub: str(r.offerSub, DEFAULT_SETTINGS.offerSub),
    giftStartingPrice: nullableStr(r.giftStartingPrice),
    exchangeNote: nullableStr(r.exchangeNote),
    popupText: nullableStr(r.popupText),
    popupEnabled: bool(r.popupEnabled, DEFAULT_SETTINGS.popupEnabled),
    assurance: {
      purity: bool(assurance.purity, DEFAULT_SETTINGS.assurance.purity),
      exchange: bool(assurance.exchange, DEFAULT_SETTINGS.assurance.exchange),
      replacement: bool(assurance.replacement, DEFAULT_SETTINGS.assurance.replacement),
      maintenance: bool(assurance.maintenance, DEFAULT_SETTINGS.assurance.maintenance),
    },
    socials: {
      instagram: str(socials.instagram, ""),
      facebook: str(socials.facebook, ""),
      youtube: str(socials.youtube, ""),
    },
    rateConfig: {
      provider: RATE_PROVIDERS.includes(rate.provider)
        ? (rate.provider as RateConfig["provider"])
        : DEFAULT_SETTINGS.rateConfig.provider,
      useLiveFeed: {
        gold: bool(live.gold, DEFAULT_SETTINGS.rateConfig.useLiveFeed.gold),
        silver: bool(live.silver, DEFAULT_SETTINGS.rateConfig.useLiveFeed.silver),
      },
      importDutyPct: num(rate.importDutyPct, 0),
      premiumPerGram: num(rate.premiumPerGram, 0),
      shopRulePerGram: num(rate.shopRulePerGram, 0),
    },
  };
}

export const PLACEHOLDER = "[CONFIRM WITH SHOP]";

/** Render a confirmed value or the explicit placeholder. */
export function confirmed(value: string | null | undefined): string {
  return value && value.trim() ? value : PLACEHOLDER;
}
