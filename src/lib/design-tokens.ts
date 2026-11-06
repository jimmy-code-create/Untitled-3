/**
 * JMD design tokens — warm cream, deep burgundy, soft gold.
 * Single source of truth for colours, type, spacing, radii and motion.
 * Do not hard-code hex values in components.
 */

export const colors = {
  // Core palette
  white: "#FFFFFF",
  cream: "#FDF1E6",
  blush: "#F3E7E8",
  peach: "#FDEFE3",
  burgundy: "#7A1F2B",
  burgundyDark: "#2E0609",
  burgundyDeep: "#1F0406",
  burgundySoft: "#3A0C10",
  gold: "#B07A2A",
  goldLight: "#F3D29A",
  goldDark: "#7A4E12",
  heading: "#2A0A0E",
  body: "#5C5457",
  whatsapp: "#0F7A3D",
  announcementFrom: "#4A0A0F",
  announcementTo: "#8B0A0A",
  roseMuted: "#D9A8B0",

  // Compatibility aliases used across existing pages.
  navy: "#2E0609",
  navyDeep: "#1F0406",
  navySoft: "#3A0C10",
  copper: "#B07A2A",
  copperLight: "#F3D29A",
  copperDark: "#7A4E12",
  ivory: "#FDF1E6",
  ivoryDim: "#F7E8D8",
  lavender: "#F3E7E8",
  marigold: "#E7B96A",
  charcoal: "#2A0A0E",
  stone: "#5C5457",
} as const;

export const gradients = {
  announcement: "linear-gradient(90deg, #4A0A0F 0%, #8B0A0A 100%)",
  goldIcon: "linear-gradient(145deg, #F3D29A 0%, #A9722A 100%)",
  burgundy: "linear-gradient(160deg, #7A1F2B 0%, #2E0609 100%)",
  footerHump: "#2E0609",
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
  hairline: "1px solid rgba(122, 31, 43, 0.12)",
  hairlineLight: "1px solid rgba(253, 241, 230, 0.18)",
} as const;

/** Soft shadows only on cards and popups. */
export const shadows = {
  card: "0 10px 30px -20px rgba(46, 6, 9, 0.28)",
  popup: "0 24px 64px -32px rgba(46, 6, 9, 0.45)",
  sticky: "0 -1px 0 rgba(122, 31, 43, 0.10), 0 8px 24px -18px rgba(46, 6, 9, 0.3)",
  modal: "0 24px 64px -32px rgba(46, 6, 9, 0.45)",
  soft: "0 1px 0 rgba(122, 31, 43, 0.08)",
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
