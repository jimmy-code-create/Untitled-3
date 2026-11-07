/**
 * Catalogue builder.
 *
 * Scans public/images/catalogue/ for photographs named by category code
 * (R-001.jpg, BR-014.png, SC-002.webp …), writes a 400px thumbnail and a
 * 1000px detail image for each, and generates src/data/catalogue.json.
 *
 *   npm run catalogue
 *
 * Optional overrides live in public/images/catalogue/products.csv (or a Google
 * Sheet exported as CSV) with the header:
 *   code,name,weight_g,purity,making_percent,subtype,occasion,status,featured
 *
 * A code that appears in the sheet uses the sheet's values. A code with no
 * weight stays weightless on purpose: the site then shows “Price on request”
 * instead of inventing a number.
 */

import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const DIR = path.join(ROOT, "public/images/catalogue");
const THUMBS = path.join(DIR, "thumbs");
const FULL = path.join(DIR, "full");
const OUT = path.join(ROOT, "src/data/catalogue.json");

/** Prefix → category. Order matters: two-letter codes are matched first. */
const PREFIXES = [
  { prefix: "BR", slug: "bracelets", label: "Bracelet", purity: "22K", making: 13, metal: "GOLD" },
  { prefix: "NP", slug: "nose-pins", label: "Nose Pin", purity: "18K", making: 16, metal: "GOLD" },
  { prefix: "SC", slug: "silver-coins", label: "Silver Coin", purity: "999", making: 8, metal: "SILVER" },
  { prefix: "MN", slug: "mens", label: "Men's", purity: "22K", making: 12, metal: "GOLD" },
  { prefix: "R", slug: "rings", label: "Gold Ring", purity: "22K", making: 12, metal: "GOLD" },
  { prefix: "D", slug: "diamond", label: "Diamond Ring", purity: "18K", making: 15, metal: "GOLD" },
  { prefix: "E", slug: "earrings", label: "Earrings", purity: "22K", making: 14, metal: "GOLD" },
  { prefix: "N", slug: "necklaces", label: "Necklace", purity: "22K", making: 12, metal: "GOLD" },
  { prefix: "P", slug: "pendants", label: "Pendant", purity: "22K", making: 14, metal: "GOLD" },
  { prefix: "B", slug: "bangles", label: "Bangle", purity: "22K", making: 12, metal: "GOLD" },
  { prefix: "M", slug: "mangalsutra", label: "Mangalsutra", purity: "22K", making: 12, metal: "GOLD" },
  { prefix: "S", slug: "silver", label: "Silver", purity: "925", making: 25, metal: "SILVER" },
  { prefix: "K", slug: "kids", label: "Kids", purity: "18K", making: 15, metal: "GOLD" },
];

const IMAGE_RE = /\.(jpe?g|png|webp|avif|tiff?)$/i;
const CODE_RE = /^([A-Z]{1,2})-(\d{1,4})$/;

const normalisePurity = (raw) => {
  const value = String(raw ?? "").trim().toUpperCase();
  if (!value) return null;
  if (value === "92.5" || value === "925" || value === "SILVER_925") return "925";
  if (value === "999" || value === "SILVER_999") return "999";
  if (/^(24|22|18|14|9)K$/.test(value)) return value;
  return null;
};

const metalFor = (purity, fallback) => (purity === "925" || purity === "999" ? "SILVER" : fallback);

/** Minimal CSV reader: handles quoted fields, escaped quotes and CRLF. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else quoted = false;
      } else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") field += char;
  }
  row.push(field);
  if (row.some((cell) => cell.trim() !== "")) rows.push(row);
  return rows;
}

async function readOverrides() {
  const file = process.env.CATALOGUE_CSV || path.join(DIR, "products.csv");
  let text;
  try {
    text = await readFile(file, "utf8");
  } catch {
    return new Map();
  }
  const rows = parseCsv(text).filter((r) => r.some((cell) => cell.trim() !== ""));
  if (rows.length < 2) return new Map();
  const header = rows[0].map((cell) => cell.trim().toLowerCase());
  const index = (name) => header.indexOf(name);
  const map = new Map();

  for (const row of rows.slice(1)) {
    const code = (row[index("code")] ?? "").trim().toUpperCase();
    if (!CODE_RE.test(code)) continue;
    map.set(code, {
      name: (row[index("name")] ?? "").trim() || null,
      weightG: Number.parseFloat(row[index("weight_g")] ?? ""),
      purity: normalisePurity(row[index("purity")]),
      makingPercent: Number.parseFloat(row[index("making_percent")] ?? ""),
      subtype: (row[index("subtype")] ?? "").trim() || null,
      occasion: (row[index("occasion")] ?? "").trim() || null,
      status: (row[index("status")] ?? "").trim().toLowerCase() || null,
      featured: /^(true|yes|1)$/i.test((row[index("featured")] ?? "").trim()),
    });
  }
  return map;
}

const round1 = (value) => Math.round(value * 10) / 10;
const natural = (code) => {
  const [, prefix, digits] = code.match(CODE_RE);
  return [prefix, Number(digits)];
};
const sortByCode = (a, b) => {
  const [pa, na] = natural(a.code);
  const [pb, nb] = natural(b.code);
  return pa === pb ? na - nb : pa.localeCompare(pb);
};

async function main() {
  await mkdir(THUMBS, { recursive: true });
  await mkdir(FULL, { recursive: true });
  await mkdir(path.dirname(OUT), { recursive: true });

  let entries = [];
  try {
    entries = await readdir(DIR, { withFileTypes: true });
  } catch {
    entries = [];
  }

  const files = entries
    .filter((entry) => entry.isFile() && IMAGE_RE.test(entry.name))
    .map((entry) => entry.name)
    .sort();

  const overrides = await readOverrides();
  const products = [];
  const skipped = [];

  for (const file of files) {
    const base = file.replace(IMAGE_RE, "").toUpperCase().replace(/\s+/g, "");
    if (!CODE_RE.test(base)) {
      skipped.push(file);
      continue;
    }
    const prefix = base.match(CODE_RE)[1];
    const category = PREFIXES.find((c) => c.prefix === prefix);
    if (!category) {
      skipped.push(`${file} (unknown prefix ${prefix})`);
      continue;
    }

    const override = overrides.get(base) ?? {};
    const purity = override.purity ?? category.purity;
    const metal = metalFor(purity, category.metal);
    const weightG =
      Number.isFinite(override.weightG) && override.weightG > 0 ? round1(override.weightG) : null;
    const makingPercent =
      Number.isFinite(override.makingPercent) && override.makingPercent >= 0
        ? round1(override.makingPercent)
        : category.making;

    const source = path.join(DIR, file);
    const thumbFile = path.join(THUMBS, `${base}.webp`);
    const fullFile = path.join(FULL, `${base}.webp`);

    await sharp(source).rotate().resize({ width: 400, withoutEnlargement: true }).webp({ quality: 78 }).toFile(thumbFile);
    await sharp(source).rotate().resize({ width: 1000, withoutEnlargement: true }).webp({ quality: 82 }).toFile(fullFile);

    const blurBuffer = await sharp(source).rotate().resize({ width: 16 }).webp({ quality: 40 }).toBuffer();

    products.push({
      code: base,
      name: override.name || `${category.label} ${base}`,
      category: category.slug,
      categoryLabel: category.label,
      metal,
      purity,
      weightG,
      makingPercent,
      hasWeight: weightG !== null,
      subtype: override.subtype ?? null,
      occasion: override.occasion ?? null,
      status: override.status ?? "available",
      featured: Boolean(override.featured),
      image: `/images/catalogue/full/${base}.webp`,
      thumb: `/images/catalogue/thumbs/${base}.webp`,
      blur: `data:image/webp;base64,${blurBuffer.toString("base64")}`,
    });
  }

  products.sort(sortByCode);

  const payload = {
    generatedAt: new Date().toISOString(),
    count: products.length,
    products,
  };
  await writeFile(OUT, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  const byCategory = products.reduce((acc, product) => {
    acc[product.categoryLabel] = (acc[product.categoryLabel] ?? 0) + 1;
    return acc;
  }, {});

  console.log(`catalogue: ${products.length} product(s) → ${path.relative(ROOT, OUT)}`);
  if (products.length) {
    console.log(
      "by category: " +
        Object.entries(byCategory)
          .map(([label, count]) => `${label} ${count}`)
          .join(" · "),
    );
    const priced = products.filter((p) => p.hasWeight).length;
    console.log(`with weight (approx price): ${priced} · price on request: ${products.length - priced}`);
  } else {
    console.log(`no images found in ${path.relative(ROOT, DIR)} — add R-001.jpg, D-001.jpg … and rerun`);
  }
  if (skipped.length) console.log(`skipped ${skipped.length}: ${skipped.slice(0, 6).join(", ")}`);
}

await main();
