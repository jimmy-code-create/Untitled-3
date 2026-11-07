/**
 * Rate provider configuration — the single place to switch feed, endpoint and
 * cache lifetimes. Client-safe: no secrets, no server imports, so the browser
 * poller and the serverless proxy read the same numbers.
 *
 * Free tier reality check (Goldpricez): 30–60 requests/hour per key. A 3-minute
 * proxy cache is at most 20 upstream calls/hour, which leaves headroom for the
 * admin refresh button too.
 */

export type ProviderName = "goldpricez" | "metals-api" | "free" | "manual";

export interface ProviderConfig {
  /** Stable id also stored in shop settings. */
  name: ProviderName;
  label: string;
  /** Upstream endpoint hit by the serverless proxy (never by the browser). */
  endpoint: string;
  /** Header that carries the API key. */
  authHeader?: string;
  /** Env var that holds the key. Keep it server-side only. */
  envKey?: string;
  /** Human note shown in /admin/rates. */
  note: string;
}

export const RATE_PROVIDER = {
  /** Which provider the engine uses unless the owner overrides it in settings. */
  active: "goldpricez" as ProviderName,

  providers: {
    goldpricez: {
      name: "goldpricez",
      label: "Goldpricez (free tier: 30–60 req/hour)",
      endpoint: "https://goldpricez.com/api/rates/currency/usd/measure/ounce/metal/all",
      authHeader: "X-API-KEY",
      envKey: "GOLDPRICEZ_API_KEY",
      note: "Gold and silver spot in USD per troy ounce, converted to INR per gram by the proxy.",
    },
    "metals-api": {
      name: "metals-api",
      label: "Metals-API (key required)",
      endpoint: "https://metals-api.com/api/latest",
      envKey: "METAL_API_KEY",
      note: "Older key-based feed, kept as a switchable alternative.",
    },
    free: {
      name: "free",
      label: "Keyless market feed (Yahoo + Frankfurter)",
      endpoint: "https://query1.finance.yahoo.com/v8/finance/chart/GC=F",
      note: "No key and no quota, slightly coarser than a dedicated metals feed.",
    },
    manual: {
      name: "manual",
      label: "Manual rates only",
      endpoint: "",
      note: "No upstream calls. Prices follow the rate board the owner publishes.",
    },
  } satisfies Record<ProviderName, ProviderConfig>,

  /**
   * Caching contract.
   *  spotTtlMs      — upstream metals snapshot is reused for 3 minutes
   *  fxTtlMs        — USD→INR is reused for 1 hour
   *  proxySMaxAge   — edge/CDN cache for /api/rates, in seconds (matches spotTtlMs)
   *  clientPollMs   — browser polls only our proxy, every 45 seconds
   *  staleGraceMs   — after this without a successful fetch the UI says "Updated …"
   */
  cache: {
    spotTtlMs: 3 * 60 * 1000,
    fxTtlMs: 60 * 60 * 1000,
    proxySMaxAge: 180,
    clientPollMs: 45 * 1000,
    staleGraceMs: 10 * 60 * 1000,
  },

  fx: {
    /** Free forex API, no key. */
    endpoint: "https://api.frankfurter.dev/v1/latest?base=USD&symbols=INR",
    /** Used only if the forex call fails. Override with USD_INR_FALLBACK. */
    fallbackUsdInr: 93.9,
    envKey: "USD_INR_FALLBACK",
  },
} as const;
