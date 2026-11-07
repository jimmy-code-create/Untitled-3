import type { CatalogProduct } from "./catalog";

/**
 * Ring catalogue.
 *
 * The shop's two design sheets contain 60 ring designs. Each design is made in
 * four metal variants — 22K yellow gold, 22K rose gold, 18K gold and 925
 * silver — and five weight builds, which is 1,200 SKUs without inventing a
 * single design that is not on the sheet.
 *
 * Rules kept from the rest of the site:
 *  - no invented reviews → rating 0 / reviewCount 0 (the UI hides empty ratings)
 *  - no invented discounts → the struck price on a card is yesterday's rate price
 *  - no borrowed photos → art is generated per design and metal by
 *    scripts/generate-ring-art.mjs (transparent, consistent product shots)
 */

type Gem = "cz" | "ruby" | "emerald";

interface RingDesign {
  /** Matches the generated art: /images/rings/<id>-<metal>.webp */
  id: string;
  name: string;
  nameHi: string;
  hindi: string;
  gem: Gem;
  /** Middle weight build in grams. */
  weight: number;
  makingPct: number;
  tags: string[];
}

const NAME_POOL: [string, string][] = [
  ["Aadya", "आद्या"],
  ["Aarohi", "आरोही"],
  ["Ishita", "इशिता"],
  ["Meher", "मेहर"],
  ["Noor", "नूर"],
  ["Saanvi", "सान्वी"],
  ["Riddhi", "ऋद्धि"],
  ["Kanak", "कनक"],
  ["Zoya", "ज़ोया"],
  ["Tishya", "तिश्या"],
  ["Meera", "मीरा"],
  ["Anahita", "अनाहिता"],
  ["Kavya", "काव्या"],
  ["Naina", "नैना"],
  ["Saanjh", "सांझ"],
  ["Aaina", "आइना"],
  ["Mishka", "मिश्का"],
  ["Pihu", "पीहू"],
  ["Rhea", "रिया"],
  ["Saira", "साइरा"],
  ["Tara", "तारा"],
  ["Vanya", "वान्या"],
  ["Yashvi", "यश्वी"],
  ["Zara", "ज़ारा"],
  ["Anvi", "अन्वी"],
  ["Bhavya", "भव्या"],
  ["Charvi", "चार्वी"],
  ["Dhriti", "धृति"],
  ["Eesha", "ईशा"],
  ["Falguni", "फाल्गुनी"],
  ["Gauri", "गौरी"],
  ["Hiya", "हिया"],
  ["Ira", "इरा"],
  ["Jiya", "जिया"],
  ["Kritika", "कृतिका"],
  ["Lavanya", "लावण्या"],
  ["Mahi", "माही"],
  ["Nandini", "नंदिनी"],
  ["Ojaswi", "ओजस्वी"],
  ["Pari", "पारी"],
  ["Riya", "रिया"],
  ["Siya", "सिया"],
  ["Trisha", "त्रिशा"],
  ["Uma", "उमा"],
  ["Vidhi", "विधि"],
  ["Waani", "वाणी"],
  ["Yamini", "यामिनी"],
  ["Aarush", "आरुष"],
  ["Vihaan", "विहान"],
  ["Kabir", "कबीर"],
  ["Reyansh", "रेयांश"],
  ["Advik", "अद्विक"],
  ["Aryan", "आर्यन"],
  ["Dev", "देव"],
  ["Ishaan", "ईशान"],
  ["Kiaan", "कियान"],
  ["Neel", "नील"],
  ["Om", "ॐ"],
  ["Rudra", "रुद्र"],
];

const DESIGNS: RingDesign[] = [
  { id: "infinity-knot", name: "Infinity Knot", nameHi: "इन्फिनिटी नॉट", hindi: "अनंत गाँठ वाली अंगूठी", gem: "cz", weight: 2.6, makingPct: 14, tags: ["bridal", "gifting"] },
  { id: "five-petal-bloom", name: "Five Petal Bloom", nameHi: "फाइव पेटल ब्लूम", hindi: "पाँच पंखुड़ियों वाला फूल", gem: "cz", weight: 2.4, makingPct: 14, tags: ["gifting", "everyday"] },
  { id: "twist-pave", name: "Twist Pavé", nameHi: "ट्विस्ट पेवे", hindi: "घुमावदार जड़ाऊ बैंड", gem: "cz", weight: 2.8, makingPct: 15, tags: ["everyday", "gifting"] },
  { id: "ruby-crown", name: "Ruby Crown", nameHi: "रूबी क्राउन", hindi: "माणिक जड़ा मुकुट", gem: "ruby", weight: 3.2, makingPct: 16, tags: ["bridal", "gemstones"] },
  { id: "open-heart", name: "Open Heart", nameHi: "ओपन हार्ट", hindi: "खुला दिल", gem: "cz", weight: 2.2, makingPct: 14, tags: ["gifting"] },
  { id: "leaf-vine", name: "Leaf Vine", nameHi: "लीफ वाइन", hindi: "पत्तों की बेल", gem: "cz", weight: 2.5, makingPct: 15, tags: ["everyday", "gifting"] },
  { id: "rose-knot", name: "Rose Knot", nameHi: "रोज़ नॉट", hindi: "गुलाबी सोने की गाँठ", gem: "cz", weight: 2.7, makingPct: 15, tags: ["gifting", "bridal"] },
  { id: "tiara-crown", name: "Tiara Crown", nameHi: "टियारा क्राउन", hindi: "टियारा जैसा मुकुट", gem: "cz", weight: 3.0, makingPct: 16, tags: ["bridal"] },
  { id: "rope-braid", name: "Rope Braid", nameHi: "रोप ब्रेड", hindi: "रस्सी जैसी लट वाला बैंड", gem: "cz", weight: 3.4, makingPct: 12, tags: ["everyday"] },
  { id: "floral-cluster", name: "Floral Cluster", nameHi: "फ्लोरल क्लस्टर", hindi: "फूलों का गुच्छा", gem: "cz", weight: 2.8, makingPct: 15, tags: ["bridal", "gifting"] },
  { id: "ruby-heart", name: "Ruby Heart", nameHi: "रूबी हार्ट", hindi: "माणिक वाला दिल", gem: "ruby", weight: 3.0, makingPct: 16, tags: ["bridal", "gemstones"] },
  { id: "garden-band", name: "Garden Band", nameHi: "गार्डन बैंड", hindi: "फूलों की नक्काशी वाला बैंड", gem: "cz", weight: 3.6, makingPct: 11, tags: ["everyday"] },
  { id: "swirl-butterfly", name: "Swirl Butterfly", nameHi: "स्वर्ल बटरफ्लाई", hindi: "घुमावदार तितली", gem: "cz", weight: 2.6, makingPct: 15, tags: ["gifting", "everyday"] },
  { id: "pave-butterfly", name: "Pavé Butterfly", nameHi: "पेवे बटरफ्लाई", hindi: "जड़ाऊ तितली", gem: "cz", weight: 2.7, makingPct: 16, tags: ["gifting"] },
  { id: "infinity-pave", name: "Infinity Pavé", nameHi: "इन्फिनिटी पेवे", hindi: "अनंत जड़ाऊ बैंड", gem: "cz", weight: 2.9, makingPct: 15, tags: ["bridal", "everyday"] },
  { id: "blossom-spray", name: "Blossom Spray", nameHi: "ब्लॉसम स्प्रे", hindi: "फूलों की कली", gem: "cz", weight: 2.4, makingPct: 15, tags: ["gifting"] },
  { id: "olive-vine", name: "Olive Vine", nameHi: "ऑलिव वाइन", hindi: "जैतून की पत्ती", gem: "cz", weight: 2.3, makingPct: 15, tags: ["everyday"] },
  { id: "daisy-medallion", name: "Daisy Medallion", nameHi: "डेज़ी मेडलियन", hindi: "गुलबहार का गोल", gem: "cz", weight: 3.1, makingPct: 14, tags: ["everyday", "gifting"] },
  { id: "twin-heart", name: "Twin Heart", nameHi: "ट्विन हार्ट", hindi: "दो दिल वाली अंगूठी", gem: "cz", weight: 2.5, makingPct: 15, tags: ["gifting", "bridal"] },
  { id: "diagonal-pave", name: "Diagonal Pavé", nameHi: "डायगोनल पेवे", hindi: "तिरछी जड़ाई वाला बैंड", gem: "cz", weight: 3.2, makingPct: 13, tags: ["everyday"] },
  { id: "marquise-solitaire", name: "Marquise Solitaire", nameHi: "मार्कीज़ सॉलिटेयर", hindi: "नाव के आकार का सॉलिटेयर", gem: "cz", weight: 2.6, makingPct: 16, tags: ["bridal", "gifting"] },
  { id: "five-stone", name: "Five Stone", nameHi: "फाइव स्टोन", hindi: "पाँच पत्थरों की अंगूठी", gem: "cz", weight: 2.8, makingPct: 14, tags: ["bridal", "gifting"] },
  { id: "rose-bloom", name: "Rose Bloom", nameHi: "रोज़ ब्लूम", hindi: "खिला हुआ गुलाब", gem: "cz", weight: 3.0, makingPct: 15, tags: ["gifting", "everyday"] },
  { id: "emerald-halo", name: "Emerald Halo", nameHi: "एमराल्ड हेलो", hindi: "पन्ने का घेरा", gem: "emerald", weight: 3.0, makingPct: 17, tags: ["bridal", "gemstones"] },
  { id: "filigree-swirl", name: "Filigree Swirl", nameHi: "फिलीग्री स्वर्ल", hindi: "बारीक जाली का घुमाव", gem: "cz", weight: 2.7, makingPct: 16, tags: ["bridal", "gifting"] },
  { id: "woven-lattice", name: "Woven Lattice", nameHi: "वोवन लैटिस", hindi: "बुनी हुई जाली", gem: "cz", weight: 4.0, makingPct: 11, tags: ["everyday"] },
  { id: "blossom-vine", name: "Blossom Vine", nameHi: "ब्लॉसम वाइन", hindi: "फूलों की बेल", gem: "cz", weight: 2.6, makingPct: 15, tags: ["gifting", "bridal"] },
  { id: "heart-solitaire", name: "Heart Solitaire", nameHi: "हार्ट सॉलिटेयर", hindi: "दिल के आकार का सॉलिटेयर", gem: "cz", weight: 2.5, makingPct: 16, tags: ["bridal", "gifting"] },
  { id: "north-star", name: "North Star", nameHi: "नॉर्थ स्टार", hindi: "ध्रुव तारा", gem: "cz", weight: 2.4, makingPct: 15, tags: ["gifting", "everyday"] },
  { id: "ribbon-bow", name: "Ribbon Bow", nameHi: "रिबन बो", hindi: "रिबन की गाँठ", gem: "cz", weight: 2.3, makingPct: 15, tags: ["gifting"] },
  { id: "three-band", name: "Three Band", nameHi: "थ्री बैंड", hindi: "तीन परतों वाला बैंड", gem: "cz", weight: 4.2, makingPct: 10, tags: ["everyday"] },
  { id: "lotus-six", name: "Lotus Six", nameHi: "लोटस सिक्स", hindi: "छह पंखुड़ियों का कमल", gem: "cz", weight: 2.9, makingPct: 15, tags: ["bridal", "gifting"] },
  { id: "rose-twist", name: "Rose Twist", nameHi: "रोज़ ट्विस्ट", hindi: "गुलाबी घुमाव वाला बैंड", gem: "cz", weight: 2.5, makingPct: 15, tags: ["gifting"] },
  { id: "leaf-branch", name: "Leaf Branch", nameHi: "लीफ ब्रांच", hindi: "पत्तों की डाली", gem: "cz", weight: 2.4, makingPct: 15, tags: ["everyday"] },
  { id: "stone-cluster", name: "Stone Cluster", nameHi: "स्टोन क्लस्टर", hindi: "पत्थरों का गुच्छा", gem: "cz", weight: 2.9, makingPct: 15, tags: ["bridal", "gifting"] },
  { id: "lattice-band", name: "Lattice Band", nameHi: "लैटिस बैंड", hindi: "जालीदार बैंड", gem: "cz", weight: 3.4, makingPct: 12, tags: ["everyday"] },
  { id: "wave-solitaire", name: "Wave Solitaire", nameHi: "वेव सॉलिटेयर", hindi: "लहरदार सॉलिटेयर", gem: "cz", weight: 2.6, makingPct: 15, tags: ["everyday", "gifting"] },
  { id: "ruby-rosette", name: "Ruby Rosette", nameHi: "रूबी रोज़ेट", hindi: "माणिक का फूल", gem: "ruby", weight: 3.3, makingPct: 16, tags: ["bridal", "gemstones"] },
  { id: "crystal-lattice", name: "Crystal Lattice", nameHi: "क्रिस्टल लैटिस", hindi: "क्रिस्टल जाली", gem: "cz", weight: 3.6, makingPct: 12, tags: ["everyday", "bridal"] },
  { id: "love-knot", name: "Love Knot", nameHi: "लव नॉट", hindi: "प्यार की गाँठ", gem: "cz", weight: 2.7, makingPct: 15, tags: ["gifting"] },
  { id: "flower-burst", name: "Flower Burst", nameHi: "फ्लावर बर्स्ट", hindi: "खिलता हुआ फूल", gem: "cz", weight: 2.8, makingPct: 15, tags: ["gifting", "bridal"] },
  { id: "leaf-open", name: "Leaf Open", nameHi: "लीफ ओपन", hindi: "खुली पत्ती", gem: "cz", weight: 2.2, makingPct: 15, tags: ["everyday"] },
  { id: "compass-signet", name: "Compass Signet", nameHi: "कंपास सिग्नेट", hindi: "दिशा-चक्र वाली मुद्रिका", gem: "cz", weight: 4.4, makingPct: 10, tags: ["everyday"] },
  { id: "butterfly-kiss", name: "Butterfly Kiss", nameHi: "बटरफ्लाई किस", hindi: "छोटी तितली", gem: "cz", weight: 2.1, makingPct: 16, tags: ["gifting"] },
  { id: "twist-infinity", name: "Twist Infinity", nameHi: "ट्विस्ट इन्फिनिटी", hindi: "घुमावदार अनंत", gem: "cz", weight: 2.7, makingPct: 15, tags: ["bridal", "everyday"] },
  { id: "emerald-ring", name: "Emerald Ring", nameHi: "एमराल्ड रिंग", hindi: "पन्ने की अंगूठी", gem: "emerald", weight: 2.9, makingPct: 17, tags: ["bridal", "gemstones"] },
  { id: "leaf-engraved", name: "Leaf Engraved", nameHi: "लीफ एनग्रेव्ड", hindi: "पत्तों की नक्काशी", gem: "cz", weight: 3.2, makingPct: 12, tags: ["everyday"] },
  { id: "petal-cluster", name: "Petal Cluster", nameHi: "पेटल क्लस्टर", hindi: "पंखुड़ियों का गुच्छा", gem: "cz", weight: 3.0, makingPct: 15, tags: ["bridal", "gifting"] },
  { id: "rose-heart", name: "Rose Heart", nameHi: "रोज़ हार्ट", hindi: "गुलाबी सोने का दिल", gem: "cz", weight: 2.3, makingPct: 15, tags: ["gifting"] },
  { id: "crown-solitaire", name: "Crown Solitaire", nameHi: "क्राउन सॉलिटेयर", hindi: "मुकुट वाला सॉलिटेयर", gem: "cz", weight: 3.1, makingPct: 16, tags: ["bridal"] },
  { id: "twin-leaf", name: "Twin Leaf", nameHi: "ट्विन लीफ", hindi: "दो पत्तियाँ", gem: "cz", weight: 2.4, makingPct: 15, tags: ["everyday", "gifting"] },
  { id: "floral-band", name: "Floral Band", nameHi: "फ्लोरल बैंड", hindi: "फूलों वाला बैंड", gem: "cz", weight: 3.5, makingPct: 11, tags: ["everyday"] },
  { id: "baguette-solitaire", name: "Baguette Solitaire", nameHi: "बगेट सॉलिटेयर", hindi: "लंबा सॉलिटेयर", gem: "cz", weight: 2.8, makingPct: 16, tags: ["bridal", "gifting"] },
  { id: "wide-lattice", name: "Wide Lattice", nameHi: "वाइड लैटिस", hindi: "चौड़ी जाली", gem: "cz", weight: 4.6, makingPct: 10, tags: ["everyday"] },
  { id: "twin-blossom", name: "Twin Blossom", nameHi: "ट्विन ब्लॉसम", hindi: "दो फूल", gem: "cz", weight: 2.7, makingPct: 15, tags: ["gifting", "bridal"] },
  { id: "starlight", name: "Starlight", nameHi: "स्टारलाइट", hindi: "चमकता सितारा", gem: "cz", weight: 2.5, makingPct: 15, tags: ["gifting", "everyday"] },
  { id: "rose-carved", name: "Rose Carved", nameHi: "रोज़ कार्व्ड", hindi: "गुलाब की नक्काशी", gem: "cz", weight: 3.3, makingPct: 12, tags: ["everyday", "gifting"] },
  { id: "two-stone-open", name: "Two Stone Open", nameHi: "टू स्टोन ओपन", hindi: "दो पत्थरों वाला खुला बैंड", gem: "cz", weight: 2.3, makingPct: 16, tags: ["gifting"] },
  { id: "snowflake-cluster", name: "Snowflake Cluster", nameHi: "स्नोफ्लेक क्लस्टर", hindi: "बर्फ के फूल जैसा", gem: "cz", weight: 2.9, makingPct: 16, tags: ["bridal", "gifting"] },
  { id: "butterfly-openwork", name: "Butterfly Openwork", nameHi: "बटरफ्लाई ओपनवर्क", hindi: "जालीदार तितली", gem: "cz", weight: 3.2, makingPct: 14, tags: ["gifting", "bridal"] },
];

const METALS = [
  { purity: "22K", metal: "GOLD" as const, color: "YELLOW" as const, art: "gold", weightFactor: 1, extraMaking: 0, label: "22K सोना", collection: "gold" },
  { purity: "22K", metal: "GOLD" as const, color: "ROSE" as const, art: "rose", weightFactor: 1, extraMaking: 1, label: "22K रोज़ गोल्ड", collection: "gold" },
  { purity: "18K", metal: "GOLD" as const, color: "YELLOW" as const, art: "gold", weightFactor: 0.94, extraMaking: 3, label: "18K सोना", collection: "gold" },
  { purity: "925", metal: "SILVER" as const, color: "WHITE" as const, art: "silver", weightFactor: 0.86, extraMaking: 14, label: "925 चाँदी", collection: "silver" },
];

const WEIGHT_STEPS = [0.85, 1, 1.18, 1.38, 1.6];
const RING_SIZES = ["10", "12", "14", "16", "18", "20"];

const GEM_VALUE: Record<Gem, number> = { cz: 900, ruby: 42000, emerald: 36000 };

const OCCASIONS: Record<string, string[]> = {
  bridal: ["wedding", "karwa-chauth"],
  gifting: ["gifting", "diwali"],
  everyday: ["gifting"],
  gemstones: ["wedding", "akshaya-tritiya"],
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const round1 = (value: number) => Math.round(value * 10) / 10;

const rows: CatalogProduct[] = [];
let index = 0;

for (const [designIndex, design] of DESIGNS.entries()) {
  for (const [metalIndex, variant] of METALS.entries()) {
    for (const [step, factor] of WEIGHT_STEPS.entries()) {
      const [person, personHi] = NAME_POOL[(designIndex * 7 + metalIndex * 3 + step * 5) % NAME_POOL.length];
      const weight = round1(design.weight * variant.weightFactor * factor);
      const makingPct = design.makingPct + variant.extraMaking;
      const gemValue = design.gem === "cz" ? 900 : Math.round((GEM_VALUE[design.gem] * (0.8 + factor * 0.2)) / 500) * 500;
      const isSilver = variant.metal === "SILVER";
      const altArt = isSilver ? "gold" : "silver";

      rows.push({
        slug: `${slugify(person)}-${design.id}-${variant.purity.toLowerCase()}-${variant.art}-${step + 1}`,
        name: `${person} ${design.name}`,
        nameHi: `${personHi} ${design.nameHi}`,
        subtitle: `${design.hindi} · ${variant.purity} ${isSilver ? "चाँदी" : "सोना"}`,
        description: `${design.hindi} — ${variant.label}, वज़न ${weight} ग्राम। दाम वज़न और आज के भाव से बनता है, इसलिए रोज़ बदलता है। हर पीस हॉलमार्क, बिल और सर्टिफिकेट के साथ मिलता है।`,
        story: `${design.nameHi} (${design.name}) हिंडौन में हाथ से तैयार होती है — ${variant.label}, ${weight} ग्राम। एक ही डिज़ाइन सोने और चाँदी, दोनों में उपलब्ध है।`,
        metal: variant.metal,
        metalColor: variant.color,
        purity: variant.purity,
        weight,
        gemstoneValue: gemValue,
        gemstoneCarats: design.gem === "cz" ? undefined : round1(1 + factor * 0.3),
        gemstoneSlug: design.gem === "ruby" ? "ruby" : design.gem === "emerald" ? "emerald" : undefined,
        makingPct,
        images: [`/images/rings/${design.id}-${variant.art}.webp`, `/images/rings/${design.id}-${altArt}.webp`],
        category: "ring",
        collections: [variant.collection, ...design.tags],
        occasions: [...new Set(design.tags.flatMap((tag) => OCCASIONS[tag] ?? ["gifting"]))],
        sizes: [RING_SIZES[(designIndex + step) % RING_SIZES.length], ...RING_SIZES.filter((s) => s !== RING_SIZES[(designIndex + step) % RING_SIZES.length])],
        badges: [],
        certifications: isSilver ? ["925 Hallmark"] : design.gem === "cz" ? ["BIS Hallmark"] : ["BIS Hallmark", "IGI"],
        certificateNo: isSilver
          ? `SLV-925-${3000 + index}`
          : design.gem === "cz"
            ? `BIS-HM-${variant.purity}-${2000 + index}`
            : `IGI-${4900000000 + index * 41}`,
        stock: 1 + (index % 6),
        rating: 0,
        reviewCount: 0,
        isNew: index % 9 === 0,
      });

      index += 1;
    }
  }
}

export const bulkProducts: CatalogProduct[] = rows;

export const catalogSize = bulkProducts.length;
