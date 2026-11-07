/**
 * Ring art generator.
 *
 * Draws one transparent 4:5 "product photo" per ring design in each metal
 * colour, so the 60 designs in the catalogue have consistent art instead of
 * borrowed photos of different pieces.
 *
 *   node scripts/generate-ring-art.mjs
 *
 * Output: public/images/rings/<design>-<metal>.webp
 */

import { mkdir } from "node:fs/promises";
import sharp from "sharp";

const W = 1200;
const H = 1500;

const METALS = {
  gold: { light: "#fdf0c4", mid: "#e6bd63", dark: "#ab7d24", deep: "#7d5814", shade: "rgba(120,86,24,0.16)" },
  rose: { light: "#fbe0d2", mid: "#e0a488", dark: "#b4735a", deep: "#8a4f3a", shade: "rgba(140,86,64,0.16)" },
  silver: { light: "#ffffff", mid: "#d5dbe3", dark: "#98a2ae", deep: "#6f7985", shade: "rgba(90,100,112,0.14)" },
};

const GEMS = {
  cz: { a: "#ffffff", b: "#dbe4ee", c: "#a9b7c7", glow: "#f4f9ff" },
  ruby: { a: "#ff7a8c", b: "#c8173c", c: "#7d0c25", glow: "#ffcdd4" },
  emerald: { a: "#78e3b0", b: "#12895f", c: "#07523b", glow: "#c8f6e0" },
};

const BAND = { cx: 600, cy: 902, rx: 336, ry: 286, w: 46 };

const n = (v) => Math.round(v * 10) / 10;

/* ─────────────────────────── primitives ─────────────────────────── */

function stone(x, y, r, gem = "cz", facets = true) {
  const g = GEMS[gem] ?? GEMS.cz;
  const lines = facets
    ? Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI / 3) * i + Math.PI / 12;
        return `<line x1="${n(x)}" y1="${n(y)}" x2="${n(x + Math.cos(a) * r * 0.82)}" y2="${n(y + Math.sin(a) * r * 0.82)}" stroke="${g.c}" stroke-width="${n(r * 0.06)}" opacity="0.35"/>`;
      }).join("")
    : "";
  return `<g><circle cx="${n(x)}" cy="${n(y)}" r="${n(r)}" fill="url(#gem-${gem})"/>
    <circle cx="${n(x)}" cy="${n(y)}" r="${n(r)}" fill="none" stroke="${g.c}" stroke-width="${n(r * 0.07)}" opacity="0.55"/>
    <circle cx="${n(x - r * 0.22)}" cy="${n(y - r * 0.26)}" r="${n(r * 0.3)}" fill="${g.a}" opacity="0.55"/>${lines}</g>`;
}

/** A small bezel-set stone, used for pavé and accents. */
const chip = (x, y, r = 9) => stone(x, y, r, "cz");

function petal(cx, cy, rx, ry, rot, fill) {
  return `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" transform="rotate(${n(rot)} ${n(cx)} ${n(cy)})" fill="${fill}"/>`;
}

/** Stones spaced along the visible shank. */
function poveAlong(count, from = -Math.PI * 0.98, to = -Math.PI * 0.02, r = 8) {
  // Sit the stones on the middle of the shank (the annulus is ~36px thick).
  const rx = BAND.rx - 24;
  const ry = BAND.ry - 22;
  let out = "";
  for (let i = 0; i < count; i += 1) {
    const t = from + ((to - from) * i) / Math.max(1, count - 1);
    out += chip(BAND.cx + Math.cos(t) * rx, BAND.cy + Math.sin(t) * ry - 6, r);
  }
  return out;
}

const starPoints = (outer, inner, spikes = 5) => {
  const pts = [];
  for (let i = 0; i < spikes * 2; i += 1) {
    const a = (Math.PI / spikes) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? outer : inner;
    pts.push(`${n(Math.cos(a) * rad)},${n(Math.sin(a) * rad)}`);
  }
  return pts.join(" ");
};

/* ─────────────────────────── band styles ─────────────────────────── */

function bandSvg(style, m) {
  const { cx, cy, rx, ry } = BAND;
  // Annulus with a raised inner edge: thin at the top, thick at the bottom, so
  // the ring reads as a solid shank in perspective instead of a circle outline.
  const inner = { cx, cy: cy - 18, rx: rx - 36, ry: ry - 28 };
  const mask = `<mask id="band">
      <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fff"/>
      <ellipse cx="${inner.cx}" cy="${inner.cy}" rx="${inner.rx}" ry="${inner.ry}" fill="#000"/>
    </mask>`;
  const fill = `<rect x="${cx - rx - 20}" y="${cy - ry - 20}" width="${rx * 2 + 40}" height="${ry * 2 + 40}" fill="url(#metal)"/>`;
  const inside = (body) => body;

  let detail = "";
  if (style === "twist") {
    detail = inside(
      Array.from({ length: 7 }, (_, i) => {
        const rx2 = rx - 4 + ((i % 3) - 1) * 9;
        return `<ellipse cx="${cx}" cy="${cy}" rx="${rx2}" ry="${ry}" fill="none" stroke="${m.dark}" stroke-width="6" opacity="0.5" transform="rotate(${(i - 3) * 2.2} ${cx} ${cy})"/>`;
      }).join(""),
    );
  } else if (style === "pave") {
    detail = inside(poveAlong(24, -Math.PI * 0.99, -Math.PI * 0.01, 8));
  } else if (style === "lattice") {
    const lines = [];
    for (let i = -14; i <= 14; i += 1) {
      lines.push(`<line x1="${cx - rx + i * 26}" y1="${cy - ry}" x2="${cx - rx + i * 26 + 260}" y2="${cy + ry}" stroke="${m.dark}" stroke-width="7" opacity="0.45"/>`);
      lines.push(`<line x1="${cx - rx + i * 26}" y1="${cy + ry}" x2="${cx - rx + i * 26 + 260}" y2="${cy - ry}" stroke="${m.dark}" stroke-width="7" opacity="0.45"/>`);
    }
    detail = inside(lines.join(""));
  } else if (style === "braid") {
    detail = inside(
      Array.from({ length: 46 }, (_, i) => {
        const t = -Math.PI + (i / 45) * Math.PI * 2;
        const x = cx + Math.cos(t) * rx;
        const y = cy + Math.sin(t) * ry;
        const rot = (t * 180) / Math.PI + 45;
        return `<ellipse cx="${n(x)}" cy="${n(y)}" rx="15" ry="8" fill="none" stroke="${m.dark}" stroke-width="6" opacity="0.5" transform="rotate(${n(rot)} ${n(x)} ${n(y)})"/>`;
      }).join(""),
    );
  } else if (style === "engraved") {
    detail = inside(
      Array.from({ length: 14 }, (_, i) => {
        const t = -Math.PI * 0.96 + ((Math.PI * 0.92) / 13) * i;
        const x = cx + Math.cos(t) * rx;
        const y = cy + Math.sin(t) * ry;
        return `<circle cx="${n(x)}" cy="${n(y)}" r="7" fill="none" stroke="${m.dark}" stroke-width="4" opacity="0.55"/>`;
      }).join(""),
    );
  } else if (style === "wide") {
    detail = `<ellipse cx="${cx}" cy="${cy - 6}" rx="${rx + 8}" ry="${ry - 6}" fill="none" stroke="${m.dark}" stroke-width="4" opacity="0.28"/>
      <ellipse cx="${cx}" cy="${cy - 22}" rx="${rx - 12}" ry="${ry - 16}" fill="none" stroke="${m.light}" stroke-width="3" opacity="0.4"/>`;
  }

  const rim = `<ellipse cx="${inner.cx}" cy="${inner.cy}" rx="${inner.rx}" ry="${inner.ry}" fill="none" stroke="${m.deep}" stroke-width="7" opacity="0.32"/>`;

  return `${mask}
    <g mask="url(#band)">
      ${fill}
      ${detail}
      <ellipse cx="${cx}" cy="${cy}" rx="${rx - 4}" ry="${ry - 4}" fill="none" stroke="${m.deep}" stroke-width="12" opacity="0.16"/>
      <path d="M${n(cx - rx * 0.9)} ${n(cy - ry * 0.34)} A ${n(rx * 0.94)} ${n(ry * 0.94)} 0 0 1 ${n(cx + rx * 0.1)} ${n(cy - ry * 0.97)}"
        fill="none" stroke="#ffffff" stroke-width="9" stroke-linecap="round" opacity="0.38"/>
    </g>
    ${rim}`;
}

/* ─────────────────────────── centrepieces ─────────────────────────── */

const MOTIFS = {
  none: () => "",

  solitaire: (m, gem) => `
    <path d="M-34 -8 L-22 -44 L22 -44 L34 -8 L0 26 Z" fill="url(#metal)" opacity="0.35"/>
    ${stone(0, -18, 34, gem)}
    <path d="M-34 -8 C-46 12 -30 30 0 16 C30 30 46 12 34 -8" fill="none" stroke="url(#metal)" stroke-width="11" stroke-linecap="round"/>`,

  halo: (m, gem) => `
    <g>${Array.from({ length: 12 }, (_, i) => {
      const a = (Math.PI / 6) * i;
      return chip(Math.cos(a) * 62, Math.sin(a) * 62, 10);
    }).join("")}</g>
    <circle r="52" fill="url(#metal)"/>
    ${stone(0, 0, 42, gem)}
    <path d="M-74 12 C-86 34 -60 52 -30 38 M74 12 C86 34 60 52 30 38" fill="none" stroke="url(#metal)" stroke-width="12" stroke-linecap="round"/>`,

  threestone: (m, gem) => `
    ${stone(-74, 2, 26, gem)}${stone(0, -10, 34, gem)}${stone(74, 2, 26, gem)}
    <path d="M-128 22 C-96 44 -36 40 0 30 C36 40 96 44 128 22" fill="none" stroke="url(#metal)" stroke-width="12" stroke-linecap="round"/>`,

  twostone: (m, gem) => `
    ${stone(-40, -6, 30, gem)}${stone(40, -6, 30, gem)}
    <path d="M-44 26 C-78 46 -116 30 -128 4 M44 26 C78 46 116 30 128 4" fill="none" stroke="url(#metal)" stroke-width="12" stroke-linecap="round"/>`,

  cluster: (m, gem) => `
    ${[[-46, -12, 16], [46, -12, 16], [0, 20, 16], [-30, -52, 15], [30, -52, 15], [0, -30, 22]]
      .map(([x, y, r]) => stone(x, y, r, gem))
      .join("")}
    <path d="M-78 6 C-92 34 -50 58 0 40 C50 58 92 34 78 6" fill="none" stroke="url(#metal)" stroke-width="11" stroke-linecap="round"/>`,

  heart: (m, gem) => `
    <path d="M0 44 C-64 4 -72 -50 -34 -64 C-14 -72 0 -54 0 -40 C0 -54 14 -72 34 -64 C72 -50 64 4 0 44 Z"
      fill="none" stroke="url(#metal)" stroke-width="14" stroke-linejoin="round"/>
    ${stone(34, -34, 9)}`,

  heartstone: (m, gem) => `
    <path d="M0 46 C-66 4 -74 -52 -35 -66 C-14 -74 0 -56 0 -42 C0 -56 14 -74 35 -66 C74 -52 66 4 0 46 Z"
      fill="url(#metal)" opacity="0.9"/>
    <path d="M0 34 C-46 4 -52 -38 -25 -47 C-10 -52 0 -40 0 -30 C0 -40 10 -52 25 -47 C52 -38 46 4 0 34 Z"
      fill="none" stroke="${m.light}" stroke-width="5" opacity="0.75"/>
    ${Array.from({ length: 8 }, (_, i) => {
      const a = (Math.PI / 4) * i + 0.4;
      return chip(Math.cos(a) * 30, Math.sin(a) * 22 - 4, 6);
    }).join("")}`,

  flower5: (m, gem) => `
    ${Array.from({ length: 5 }, (_, i) => {
      const a = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      return petal(Math.cos(a) * 44, Math.sin(a) * 44, 34, 42, (a * 180) / Math.PI + 90, "url(#metal)");
    }).join("")}
    ${Array.from({ length: 5 }, (_, i) => {
      const a = (Math.PI * 2 * i) / 5 - Math.PI / 2 + 0.63;
      return chip(Math.cos(a) * 40, Math.sin(a) * 40, 7);
    }).join("")}
    <circle r="20" fill="url(#metal)"/>${stone(0, 0, 14, gem)}`,

  flower6: (m, gem) => `
    ${Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI * 2 * i) / 6 - Math.PI / 2;
      return petal(Math.cos(a) * 50, Math.sin(a) * 50, 30, 48, (a * 180) / Math.PI + 90, "url(#metal)");
    }).join("")}
    <circle r="26" fill="url(#metal)"/>${stone(0, 0, 18, gem)}`,

  medallion: (m, gem) => `
    <circle r="76" fill="url(#metal)"/>
    <circle r="60" fill="none" stroke="${m.dark}" stroke-width="4" opacity="0.4"/>
    ${Array.from({ length: 8 }, (_, i) => {
      const a = (Math.PI / 4) * i;
      return petal(Math.cos(a) * 34, Math.sin(a) * 34, 10, 22, (a * 180) / Math.PI + 90, m.light);
    }).join("")}
    ${stone(0, 0, 16, gem, true)}`,

  infinity: (m, gem) => `
    <path d="M0 0 C-44 -58 -132 -46 -132 0 C-132 46 -44 58 0 0 C44 -58 132 -46 132 0 C132 46 44 58 0 0"
      fill="none" stroke="url(#metal)" stroke-width="17" stroke-linejoin="round"/>
    ${[0.18, 0.38, 0.62, 0.82].map((t, i) => chip(-120 + 96 * t, -34 + i * 2, 8)).join("")}
    ${[0.18, 0.38, 0.62, 0.82].map((t, i) => chip(24 + 96 * t, -34 + i * 2, 8)).join("")}`,

  knot: (m, gem) => `
    <ellipse rx="78" ry="42" transform="rotate(-24)" fill="none" stroke="url(#metal)" stroke-width="18"/>
    <ellipse rx="78" ry="42" transform="rotate(36)" fill="none" stroke="url(#metal)" stroke-width="18"/>
    <ellipse rx="26" ry="18" fill="url(#metal)"/>${chip(0, 0, 9)}`,

  leaf: (m, gem) => `
    <path d="M-6 66 C-64 34 -62 -34 0 -66 C62 -34 64 34 6 66 Z" fill="url(#metal)"/>
    <path d="M0 60 L0 -58" stroke="${m.dark}" stroke-width="5" opacity="0.55"/>
    ${Array.from({ length: 5 }, (_, i) => {
      const y = 34 - i * 22;
      return `<path d="M0 ${y} L-24 ${y - 12} M0 ${y} L24 ${y - 12}" stroke="${m.dark}" stroke-width="4" opacity="0.5"/>` + chip(-20, y - 14, 5) + chip(20, y - 14, 5);
    }).join("")}`,

  leafopen: (m, gem) => `
    <path d="M0 66 C-74 30 -76 -40 -6 -72 C-30 -20 -26 30 0 66 Z" fill="url(#metal)"/>
    <path d="M0 66 C74 30 76 -40 6 -72 C30 -20 26 30 0 66 Z" fill="url(#metal)" opacity="0.8"/>
    ${chip(-34, -6, 8)}${chip(34, -6, 8)}`,

  vine: (m, gem) => `
    <path d="M-128 46 C-96 -8 -44 -34 0 -34 C44 -34 96 -8 128 46" fill="none" stroke="url(#metal)" stroke-width="13" stroke-linecap="round"/>
    ${[[-96, 12], [-62, -22], [-20, -40], [22, -40], [64, -22], [98, 12]]
      .map(([x, y], i) => `<path d="M${x} ${y} c -22 -6 -34 -22 -30 -40 c 20 2 34 16 38 32 Z" fill="url(#metal)" opacity="${0.85 - i * 0.04}"/>` + chip(x + 6, y - 8, 5))
      .join("")}`,

  crown: (m, gem) => `
    <path d="M-92 34 L-92 -18 L-56 12 L-28 -54 L0 12 L28 -54 L56 12 L92 -18 L92 34 Z" fill="url(#metal)"/>
    ${chip(-92, -22, 9)}${chip(-28, -58, 11)}${chip(28, -58, 11)}${chip(92, -22, 9)}
    ${stone(0, 22, 24, gem)}
    <path d="M-96 40 L96 40" stroke="${m.dark}" stroke-width="7" opacity="0.45"/>`,

  butterfly: (m, gem) => `
    <g transform="translate(0 4)">
      <ellipse cx="-44" cy="-22" rx="44" ry="30" transform="rotate(-24 -44 -22)" fill="url(#metal)"/>
      <ellipse cx="44" cy="-22" rx="44" ry="30" transform="rotate(24 44 -22)" fill="url(#metal)"/>
      <ellipse cx="-34" cy="30" rx="30" ry="22" transform="rotate(-18 -34 30)" fill="url(#metal)" opacity="0.85"/>
      <ellipse cx="34" cy="30" rx="30" ry="22" transform="rotate(18 34 30)" fill="url(#metal)" opacity="0.85"/>
      ${chip(-44, -22, 6)}${chip(44, -22, 6)}${chip(-30, 30, 5)}${chip(30, 30, 5)}
      <rect x="-7" y="-34" width="14" height="76" rx="7" fill="url(#metal)"/>
      ${stone(0, -12, 10, gem)}
      <path d="M-6 -34 C-18 -54 -30 -58 -38 -60 M6 -34 C18 -54 30 -58 38 -60" stroke="url(#metal)" stroke-width="6" fill="none" stroke-linecap="round"/>
    </g>`,

  star: (m, gem) => `
    <polygon points="${starPoints(88, 36)}" fill="url(#metal)"/>
    ${stone(0, 0, 20, gem)}
    <path d="M-120 32 C-86 54 -34 52 0 40 C34 52 86 54 120 32" fill="none" stroke="url(#metal)" stroke-width="12" stroke-linecap="round"/>`,

  bow: (m, gem) => `
    <path d="M-8 -4 C-72 -46 -118 -22 -106 10 C-96 38 -46 40 -8 10 Z" fill="url(#metal)"/>
    <path d="M8 -4 C72 -46 118 -22 106 10 C96 38 46 40 8 10 Z" fill="url(#metal)"/>
    <path d="M-18 18 C-40 44 -48 62 -34 72 M18 18 C40 44 48 62 34 72" fill="none" stroke="url(#metal)" stroke-width="13" stroke-linecap="round"/>
    <ellipse rx="18" ry="15" fill="url(#metal)"/>${stone(0, 0, 11, gem)}`,

  rose: (m, gem) => `
    <circle r="62" fill="url(#metal)"/>
    <path d="M0 -46 C30 -46 48 -22 44 4 C40 32 12 46 -10 40 C-34 34 -44 10 -32 -8 C-22 -24 2 -24 8 -6 C14 12 -2 22 -14 14"
      fill="none" stroke="${m.dark}" stroke-width="8" stroke-linecap="round" opacity="0.75"/>
    <path d="M-62 6 C-72 40 -40 66 0 62 C46 58 70 24 62 -8" fill="none" stroke="url(#metal)" stroke-width="14" stroke-linecap="round"/>
    ${chip(-58, 12, 6)}${chip(58, 12, 6)}`,

  signet: (m, gem) => `
    <ellipse rx="76" ry="62" fill="url(#metal)"/>
    <ellipse rx="60" ry="46" fill="none" stroke="${m.dark}" stroke-width="4" opacity="0.5"/>
    <path d="M0 -34 L0 34 M-26 0 L26 0 M-18 -24 L18 24 M18 -24 L-18 24" stroke="${m.dark}" stroke-width="6" opacity="0.65"/>
    <ellipse rx="18" ry="12" fill="${m.light}" opacity="0.6"/>`,

  marquise: (m, gem) => `
    <path d="M-40 0 L0 -60 L40 0 L0 60 Z" fill="url(#metal)" opacity="0.35"/>
    <path d="M-32 0 L0 -50 L32 0 L0 50 Z" fill="url(#gem-${gem})" stroke="${GEMS[gem].c}" stroke-width="5"/>
    <path d="M-44 0 C-60 20 -40 44 -6 34 M44 0 C60 20 40 44 6 34" fill="none" stroke="url(#metal)" stroke-width="12" stroke-linecap="round"/>`,

  baguette: (m, gem) => `
    <rect x="-58" y="-32" width="116" height="64" rx="10" fill="url(#metal)" opacity="0.4"/>
    <rect x="-46" y="-24" width="92" height="48" rx="6" fill="url(#gem-${gem})" stroke="${GEMS[gem].c}" stroke-width="5"/>
    <path d="M-46 -8 L46 -8 M-46 8 L46 8" stroke="${GEMS[gem].c}" stroke-width="3" opacity="0.4"/>
    <path d="M-62 6 C-84 30 -52 52 -18 40 M62 6 C84 30 52 52 18 40" fill="none" stroke="url(#metal)" stroke-width="12" stroke-linecap="round"/>`,

  snowflake: (m, gem) => `
    ${Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i;
      const x = Math.cos(a) * 62;
      const y = Math.sin(a) * 62;
      return `<line x1="0" y1="0" x2="${n(x)}" y2="${n(y)}" stroke="url(#metal)" stroke-width="12" stroke-linecap="round"/>`
        + chip(x, y, 10)
        + `<path d="M${n(x * 0.62)} ${n(y * 0.62)} l ${n(-Math.sin(a) * 16 + Math.cos(a) * 12)} ${n(Math.cos(a) * 16 + Math.sin(a) * 12)}" stroke="url(#metal)" stroke-width="7" stroke-linecap="round"/>`;
    }).join("")}
    ${stone(0, 0, 20, gem)}`,

  filigree: (m, gem) => `
    <path d="M-118 30 C-118 -26 -64 -58 -18 -44 C0 -38 0 -18 -14 -12 M118 30 C118 -26 64 -58 18 -44 C0 -38 0 -18 14 -12"
      fill="none" stroke="url(#metal)" stroke-width="13" stroke-linecap="round"/>
    <path d="M-62 22 C-62 -8 -30 -26 -6 -18 M62 22 C62 -8 30 -26 6 -18" fill="none" stroke="url(#metal)" stroke-width="9" stroke-linecap="round"/>
    ${chip(-84, 8, 8)}${chip(84, 8, 8)}${chip(-40, -26, 7)}${chip(40, -26, 7)}
    ${stone(0, 6, 22, gem)}`,

  spray: (m, gem) => `
    <path d="M-110 46 C-70 6 -30 -18 0 -22 C30 -18 70 6 110 46" fill="none" stroke="url(#metal)" stroke-width="11" stroke-linecap="round"/>
    ${[[-72, 18], [-40, -14], [0, -30], [40, -14], [72, 18]]
      .map(([x, y], i) => stone(x, y, i === 2 ? 18 : 12, i === 2 ? gem : "cz"))
      .join("")}
    ${[[-92, 34], [92, 34]].map(([x, y]) => `<path d="M${x} ${y} c -18 -8 -26 -24 -20 -40 c 16 4 26 18 28 34 Z" fill="url(#metal)" opacity="0.8"/>`).join("")}`,

  weave: (m, gem) => `
    <path d="M-118 6 C-118 -34 -58 -52 0 -26 C58 -52 118 -34 118 6" fill="none" stroke="url(#metal)" stroke-width="12" stroke-linecap="round"/>
    <path d="M-118 22 C-118 -18 -58 -36 0 -10 C58 -36 118 -18 118 22" fill="none" stroke="url(#metal)" stroke-width="12" stroke-linecap="round" opacity="0.85"/>
    ${chip(0, -40, 9)}${chip(-60, -26, 7)}${chip(60, -26, 7)}`,

  wave: (m, gem) => `
    <path d="M-120 20 C-80 -14 -40 34 0 0 C40 -34 80 14 120 24" fill="none" stroke="url(#metal)" stroke-width="14" stroke-linecap="round"/>
    ${stone(-4, -6, 24, gem)}`,

  compass: (m, gem) => `
    <ellipse rx="74" ry="58" fill="url(#metal)"/>
    <ellipse rx="56" ry="42" fill="none" stroke="${m.dark}" stroke-width="4" opacity="0.5"/>
    <polygon points="${starPoints(36, 13, 8)}" fill="${m.light}" opacity="0.85"/>
    ${stone(0, 0, 10, gem)}`,

  latticeflower: (m, gem) => `
    <circle r="58" fill="url(#metal)" opacity="0.9"/>
    ${Array.from({ length: 8 }, (_, i) => {
      const a = (Math.PI / 4) * i;
      return petal(Math.cos(a) * 34, Math.sin(a) * 34, 12, 24, (a * 180) / Math.PI + 90, m.light);
    }).join("")}
    <circle r="26" fill="url(#metal)"/>${stone(0, 0, 14, gem)}`,
};

/* ─────────────────────────────── render ─────────────────────────────── */

export function ringSvg({ motif = "solitaire", metal = "gold", band = "plain", gem = "cz" }) {
  const m = METALS[metal];
  const g = GEMS[gem] ?? GEMS.cz;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="metal" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${m.light}"/>
      <stop offset="0.42" stop-color="${m.mid}"/>
      <stop offset="0.72" stop-color="${m.dark}"/>
      <stop offset="1" stop-color="${m.mid}"/>
    </linearGradient>
    <radialGradient id="gem-cz" cx="0.38" cy="0.32" r="0.8">
      <stop offset="0" stop-color="#ffffff"/><stop offset="0.55" stop-color="${GEMS.cz.b}"/><stop offset="1" stop-color="${GEMS.cz.c}"/>
    </radialGradient>
    <radialGradient id="gem-ruby" cx="0.38" cy="0.32" r="0.8">
      <stop offset="0" stop-color="${GEMS.ruby.a}"/><stop offset="0.5" stop-color="${GEMS.ruby.b}"/><stop offset="1" stop-color="${GEMS.ruby.c}"/>
    </radialGradient>
    <radialGradient id="gem-emerald" cx="0.38" cy="0.32" r="0.8">
      <stop offset="0" stop-color="${GEMS.emerald.a}"/><stop offset="0.5" stop-color="${GEMS.emerald.b}"/><stop offset="1" stop-color="${GEMS.emerald.c}"/>
    </radialGradient>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="16"/>
    </filter>
  </defs>

  <ellipse cx="600" cy="1232" rx="286" ry="40" fill="${m.shade}" filter="url(#soft)"/>
  <g>${bandSvg(band, m)}</g>
  <g transform="translate(600 560) scale(1.24)">${MOTIFS[motif](m, gem)}</g>
</svg>`;
}

/* ─────────────────────────────── designs ─────────────────────────────── */

export const DESIGNS = [
  { id: "infinity-knot", motif: "infinity", band: "pave", gem: "cz", metals: ["gold", "rose", "silver"] },
  { id: "five-petal-bloom", motif: "flower5", band: "plain", gem: "cz", metals: ["gold", "rose", "silver"] },
  { id: "twist-pave", motif: "solitaire", band: "twist", gem: "cz", metals: ["gold", "rose", "silver"] },
  { id: "ruby-crown", motif: "crown", band: "plain", gem: "ruby", metals: ["gold", "rose", "silver"] },
  { id: "open-heart", motif: "heart", band: "plain", gem: "cz", metals: ["gold", "rose", "silver"] },
  { id: "leaf-vine", motif: "vine", band: "plain", gem: "cz", metals: ["gold", "rose", "silver"] },
  { id: "rose-knot", motif: "knot", band: "plain", gem: "cz", metals: ["rose", "gold", "silver"] },
  { id: "tiara-crown", motif: "crown", band: "plain", gem: "cz", metals: ["gold", "rose", "silver"] },
  { id: "rope-braid", motif: "none", band: "braid", gem: "cz", metals: ["gold", "rose", "silver"] },
  { id: "floral-cluster", motif: "cluster", band: "plain", gem: "cz", metals: ["gold", "rose", "silver"] },
  { id: "ruby-heart", motif: "heartstone", band: "plain", gem: "ruby", metals: ["gold", "rose", "silver"] },
  { id: "garden-band", motif: "none", band: "engraved", gem: "cz", metals: ["gold", "rose", "silver"] },
  { id: "swirl-butterfly", motif: "butterfly", band: "twist", gem: "cz", metals: ["gold", "rose", "silver"] },
  { id: "pave-butterfly", motif: "butterfly", band: "pave", gem: "cz", metals: ["gold", "rose", "silver"] },
  { id: "infinity-pave", motif: "infinity", band: "pave", gem: "cz", metals: ["gold", "rose", "silver"] },
  { id: "blossom-spray", motif: "spray", band: "plain", gem: "cz", metals: ["gold", "rose", "silver"] },
  { id: "olive-vine", motif: "leaf", band: "plain", gem: "cz", metals: ["gold", "rose", "silver"] },
  { id: "daisy-medallion", motif: "medallion", band: "plain", gem: "cz", metals: ["gold", "rose", "silver"] },
  { id: "twin-heart", motif: "twostone", band: "plain", gem: "cz", metals: ["gold", "rose", "silver"] },
  { id: "diagonal-pave", motif: "none", band: "pave", gem: "cz", metals: ["gold", "rose", "silver"] },
  { id: "marquise-solitaire", motif: "marquise", band: "plain", gem: "cz", metals: ["gold", "rose", "silver"] },
  { id: "five-stone", motif: "threestone", band: "plain", gem: "cz", metals: ["gold", "rose", "silver"] },
  { id: "rose-bloom", motif: "rose", band: "plain", gem: "cz", metals: ["gold", "rose", "silver"] },
  { id: "emerald-halo", motif: "halo", band: "pave", gem: "emerald", metals: ["gold", "rose", "silver"] },
  { id: "filigree-swirl", motif: "filigree", band: "plain", gem: "cz", metals: ["gold", "rose", "silver"] },
  { id: "woven-lattice", motif: "none", band: "lattice", gem: "cz", metals: ["gold", "rose", "silver"] },
  { id: "blossom-vine", motif: "vine", band: "twist", gem: "cz", metals: ["gold", "rose", "silver"] },
  { id: "heart-solitaire", motif: "heartstone", band: "plain", gem: "cz", metals: ["gold", "rose", "silver"] },
  { id: "north-star", motif: "star", band: "plain", gem: "cz", metals: ["gold", "rose", "silver"] },
  { id: "ribbon-bow", motif: "bow", band: "plain", gem: "cz", metals: ["gold", "rose", "silver"] },
  { id: "three-band", motif: "none", band: "wide", gem: "cz", metals: ["gold", "rose", "silver"] },
  { id: "lotus-six", motif: "flower6", band: "pave", gem: "cz", metals: ["gold", "rose", "silver"] },
  { id: "rose-twist", motif: "solitaire", band: "twist", gem: "cz", metals: ["rose", "gold", "silver"] },
  { id: "leaf-branch", motif: "leaf", band: "twist", gem: "cz", metals: ["gold", "rose", "silver"] },
  { id: "stone-cluster", motif: "cluster", band: "pave", gem: "cz", metals: ["gold", "rose", "silver"] },
  { id: "lattice-band", motif: "none", band: "lattice", gem: "cz", metals: ["gold", "rose", "silver"] },
  { id: "wave-solitaire", motif: "wave", band: "plain", gem: "cz", metals: ["gold", "rose", "silver"] },
  { id: "ruby-rosette", motif: "cluster", band: "plain", gem: "ruby", metals: ["gold", "rose", "silver"] },
  { id: "crystal-lattice", motif: "none", band: "lattice", gem: "cz", metals: ["gold", "rose", "silver"] },
  { id: "love-knot", motif: "knot", band: "pave", gem: "cz", metals: ["gold", "rose", "silver"] },
  { id: "flower-burst", motif: "flower6", band: "plain", gem: "cz", metals: ["gold", "rose", "silver"] },
  { id: "leaf-open", motif: "leafopen", band: "plain", gem: "cz", metals: ["gold", "rose", "silver"] },
  { id: "compass-signet", motif: "compass", band: "wide", gem: "cz", metals: ["gold", "rose", "silver"] },
  { id: "butterfly-kiss", motif: "butterfly", band: "plain", gem: "cz", metals: ["gold", "rose", "silver"] },
  { id: "twist-infinity", motif: "infinity", band: "twist", gem: "cz", metals: ["gold", "rose", "silver"] },
  { id: "emerald-ring", motif: "halo", band: "plain", gem: "emerald", metals: ["gold", "rose", "silver"] },
  { id: "leaf-engraved", motif: "none", band: "engraved", gem: "cz", metals: ["gold", "rose", "silver"] },
  { id: "petal-cluster", motif: "cluster", band: "braid", gem: "cz", metals: ["gold", "rose", "silver"] },
  { id: "rose-heart", motif: "heart", band: "plain", gem: "cz", metals: ["rose", "gold", "silver"] },
  { id: "crown-solitaire", motif: "crown", band: "pave", gem: "cz", metals: ["gold", "rose", "silver"] },
  { id: "twin-leaf", motif: "leafopen", band: "twist", gem: "cz", metals: ["gold", "rose", "silver"] },
  { id: "floral-band", motif: "none", band: "engraved", gem: "cz", metals: ["gold", "rose", "silver"] },
  { id: "baguette-solitaire", motif: "baguette", band: "plain", gem: "cz", metals: ["gold", "rose", "silver"] },
  { id: "wide-lattice", motif: "none", band: "wide", gem: "cz", metals: ["gold", "rose", "silver"] },
  { id: "twin-blossom", motif: "twostone", band: "pave", gem: "cz", metals: ["gold", "rose", "silver"] },
  { id: "starlight", motif: "star", band: "pave", gem: "cz", metals: ["gold", "rose", "silver"] },
  { id: "rose-carved", motif: "rose", band: "engraved", gem: "cz", metals: ["gold", "rose", "silver"] },
  { id: "two-stone-open", motif: "twostone", band: "plain", gem: "cz", metals: ["gold", "rose", "silver"] },
  { id: "snowflake-cluster", motif: "snowflake", band: "plain", gem: "cz", metals: ["gold", "rose", "silver"] },
  { id: "butterfly-openwork", motif: "butterfly", band: "lattice", gem: "cz", metals: ["gold", "rose", "silver"] },
];

/* ─────────────────────────────── main ─────────────────────────────── */

if (process.argv[1]?.endsWith("generate-ring-art.mjs")) {
  const outDir = "public/images/rings";
  await mkdir(outDir, { recursive: true });
  let made = 0;
  for (const d of DESIGNS) {
    for (const metal of d.metals) {
      const svg = ringSvg({ motif: d.motif, metal, band: d.band, gem: d.gem });
      await sharp(Buffer.from(svg))
        .resize(1000, 1250)
        .webp({ quality: 82, effort: 5 })
        .toFile(`${outDir}/${d.id}-${metal}.webp`);
      made += 1;
    }
  }
  console.log(`wrote ${made} ring images to ${outDir}`);
}
