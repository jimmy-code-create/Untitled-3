/**
 * JMD design tokens — black glass, champagne light, Instrument Serif.
 * Single source of truth for colours, type, spacing, radii and motion.
 * Do not hard-code hex values in components.
 */

export const colors = {
  // Core palette
  white: "#FFFFFF",
  /** Light ink for text on black (was the page colour in the old skin). */
  cream: "#F6F2EA",
  /** Raised glass surface. */
  blush: "#141414",
  /** Deepest panel tint. */
  peach: "#0C0C0C",
  /** Accent: champagne, used for text, rules and hairlines. */
  burgundy: "#E4C68F",
  burgundyDark: "#0B0B0B",
  burgundyDeep: "#000000",
  burgundySoft: "#1A1712",
  gold: "#D9B87C",
  goldLight: "#F4E3C4",
  goldDark: "#C3A268",
  heading: "#FFFFFF",
  body: "#A8A29A",
  whatsapp: "#1FA855",
  announcementFrom: "#0B0B0B",
  announcementTo: "#171717",
  roseMuted: "#BFA98C",

  // Compatibility aliases used across existing pages.
  navy: "#0B0B0B",
  navyDeep: "#000000",
  navySoft: "#1A1A1A",
  copper: "#C9A46A",
  copperLight: "#EAD3AC",
  copperDark: "#D8BE93",
  ivory: "#F6F2EA",
  ivoryDim: "#E7E0D4",
  lavender: "#141414",
  marigold: "#E7B96A",
  charcoal: "#EDE8DF",
  stone: "#A8A29A",
} as const;

export const gradients = {
  announcement: "linear-gradient(90deg, #0B0B0B 0%, #191919 100%)",
  goldIcon: "linear-gradient(145deg, #F4E3C4 0%, #C9A46A 100%)",
  burgundy: "linear-gradient(160deg, #171310 0%, #050505 100%)",
  footerHump: "#050505",
} as const;

/** Fixed type scale — 12 / 14 / 16 / 20 / 28 / 34 / 44 / 72. */
export const typeScale = {
  12: { fontSize: "12px", lineHeight: "18px" },
  14: { fontSize: "14px", lineHeight: "20px" },
  16: { fontSize: "16px", lineHeight: "26px" },
  20: { fontSize: "20px", lineHeight: "28px" },
  28: { fontSize: "28px", lineHeight: "34px" },
  34: { fontSize: "34px", lineHeight: "40px" },
  44: { fontSize: "44px", lineHeight: "48px" },
  72: { fontSize: "72px", lineHeight: "72px" },
} as const;

/** 8px grid. */
export const space = {
  1: "4px",
  2: "8px",
  3: "16px",
  4: "24px",
  5: "32px",
  6: "40px",
  7: "48px",
  8: "56px",
  9: "64px",
  10: "80px",
  11: "96px",
  12: "120px",
} as const;

export const radii = {
  card: "24px",
  photo: "20px",
  control: "999px",
  modal: "4px",
} as const;

export const borders = {
  hairline: "1px solid rgba(255, 255, 255, 0.10)",
  hairlineLight: "1px solid rgba(255, 255, 255, 0.18)",
} as const;

/** Soft shadows only on cards and popups. */
export const shadows = {
  card: "0 24px 60px -40px rgba(0, 0, 0, 0.9)",
  popup: "0 24px 64px -32px rgba(0, 0, 0, 0.85)",
  sticky: "0 1px 0 rgba(255, 255, 255, 0.06), 0 8px 24px -18px rgba(0, 0, 0, 0.8)",
  modal: "0 24px 64px -32px rgba(0, 0, 0, 0.85)",
  soft: "0 1px 0 rgba(255, 255, 255, 0.06)",
} as const;

export const motion = {
  reveal: { duration: 400, distance: 16, ease: [0.16, 1, 0.3, 1] as const },
  carousel: { autoplayMs: 4000, slideMs: 400 },
  drawer: { duration: 250 },
  rateFade: { duration: 200 },
  hover: { duration: 300, imageScale: 1.04 },
  logoShine: { duration: 600 },
} as const;

export const layout = {
  maxWidth: "1200px",
  textMeasure: "62ch",
  sectionPaddingDesktop: "96px",
  sectionPaddingMobile: "56px",
  gutter: "16px",
  announcementHeight: "40px",
  headerHeight: "64px",
} as const;

/** Aspect ratios are fixed per slot so nothing shifts on load. */
export const ratios = {
  product: "4 / 5",
  collection: "4 / 5",
  hero: "1 / 1",
  heroDesktop: "16 / 7",
  square: "1 / 1",
  worldTall: "3 / 4.2",
  worldShort: "1 / 1.1",
} as const;
