import type { Config } from "tailwindcss";
import { colors, radii, typeScale } from "./src/lib/design-tokens";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        cream: colors.cream,
        blush: colors.blush,
        peach: colors.peach,
        burgundy: {
          DEFAULT: colors.burgundy,
          dark: colors.burgundyDark,
          deep: colors.burgundyDeep,
          soft: colors.burgundySoft,
        },
        gold: {
          DEFAULT: colors.gold,
          light: colors.goldLight,
          dark: colors.goldDark,
        },
        ink: colors.heading,
        bodygrey: colors.body,
        whatsapp: colors.whatsapp,

        // Compatibility aliases — existing pages keep working after the restyle.
        navy: {
          DEFAULT: colors.navy,
          deep: colors.navyDeep,
          soft: colors.navySoft,
        },
        copper: {
          DEFAULT: colors.copper,
          light: colors.copperLight,
          dark: colors.copperDark,
        },
        ivory: {
          DEFAULT: colors.ivory,
          dim: colors.ivoryDim,
        },
        ivorydim: colors.ivoryDim,
        lilac: colors.lavender,
        lilacsoft: "#F9EFE9",
        marigold: colors.marigold,
        charcoal: colors.charcoal,
        stone: colors.stone,
      },
      fontFamily: {
        serif: ["Fraunces", "var(--font-fraunces)", "Cormorant Garamond", "Georgia", "serif"],
        sans: ["IBM Plex Sans", "var(--font-plex)", "Inter", "system-ui", "sans-serif"],
        script: ["Fraunces", "Cormorant Garamond", "Georgia", "serif"],
        hindi: ["Noto Sans Devanagari", "system-ui", "sans-serif"],
      },
      fontSize: Object.fromEntries(
        Object.entries(typeScale).map(([k, v]) => [k, [v.fontSize, v.lineHeight]] as [string, [string, string]]),
      ),
      borderRadius: {
        none: "0px",
        control: radii.control,
        card: radii.card,
        photo: radii.photo,
        modal: radii.modal,
      },
      letterSpacing: {
        label: "0.12em",
        wide2: "0.18em",
        widest2: "0.18em",
        widest3: "0.24em",
      },
      boxShadow: {
        card: "0 10px 30px -20px rgba(46,6,9,0.28)",
        popup: "0 24px 64px -32px rgba(46,6,9,0.45)",
        modal: "0 24px 64px -32px rgba(46,6,9,0.45)",
        sticky: "0 -1px 0 rgba(122,31,43,0.10), 0 8px 24px -18px rgba(46,6,9,0.3)",
        soft: "0 1px 0 rgba(122,31,43,0.08)",
      },
      maxWidth: {
        content: "1200px",
        measure: "62ch",
      },
      keyframes: {
        "logo-shine": {
          "0%": { transform: "translateX(-130%)" },
          "100%": { transform: "translateX(130%)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "rate-fade": {
          "0%": { opacity: "0.25" },
          "100%": { opacity: "1" },
        },
        "drawer-in": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
      animation: {
        "logo-shine": "logo-shine 600ms ease-out 300ms 1 both",
        "fade-up": "fade-up 400ms cubic-bezier(0.16,1,0.3,1) both",
        "rate-fade": "rate-fade 200ms ease-out",
        "drawer-in": "drawer-in 250ms ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
