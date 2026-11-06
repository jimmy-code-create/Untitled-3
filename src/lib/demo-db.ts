import fs from "fs";
import path from "path";
import { products as catalogProducts, defaultRates, type CatalogProduct } from "./catalog";
import { orderNumber } from "./utils";
import { DEFAULT_SETTINGS, mergeSettings } from "./settings";

/**
 * Local JSON persistence used when DATABASE_URL is not configured or the
 * Postgres instance is unreachable. Lets the storefront, checkout and admin
 * dashboard work end-to-end in a demo/preview environment.
 */

export interface DemoRate {
  id: string;
  metal: "GOLD" | "SILVER";
  purity: string;
  ratePerGram: number;
  updatedAt: string;
  source?: string;
  fetchedAt?: string | null;
  status?: "PUBLISHED" | "PENDING" | "MANUAL" | "STALE";
  feedRate?: number | null;
}

export interface DemoRateSnapshot {
  id: string;
  metal: "GOLD" | "SILVER";
  purity: string;
  ratePerGram: number;
  source: string;
  fetchedAt: string;
  status: "PUBLISHED" | "PENDING" | "MANUAL" | "STALE";
  note?: string;
}

export interface DemoRateAudit {
  id: string;
  purity: string;
  oldRate: number | null;
  newRate: number;
  actor: string;
  action: "MANUAL" | "FEED" | "PUBLISH_PENDING" | "CONFIG";
  at: string;
}

export interface DemoOrderItem {
  slug: string;
  name: string;
  image: string;
  size?: string;
  quantity: number;
  unitPrice: number;
  metalWeight: number;
  gemstoneValue: number;
  makingCharges: number;
  gst: number;
  ratePerGram?: number;
  goldValue?: number;
  priceBreakup?: object;
}

export interface DemoOrder {
  id: string;
  orderNumber: string;
  email: string;
  phone: string;
  customerName: string;
  status: string;
  paymentStatus: string;
  paymentMethod: "ONLINE" | "STORE";
  fulfillment: "DELIVERY" | "PICKUP";
  subtotal: number;
  gst: number;
  shipping: number;
  total: number;
  goldRate: number;
  rateSnapshot?: Record<string, unknown>;
  rateSnapshotId?: string;
  priceBreakup?: object;
  priceLockedUntil?: string;
  address: Record<string, string>;
  items: DemoOrderItem[];
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  trackingNo?: string;
  courier?: string;
  notes?: string;
  createdAt: string;
}

export interface DemoEnquiry {
  id: string;
  name: string;
  phone: string;
  message?: string;
  productSlug?: string;
  productName?: string;
  type: string;
  status: "NEW" | "CONTACTED" | "CLOSED";
  createdAt: string;
}

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  passwordHash?: string;
  role: "USER" | "ADMIN";
  createdAt: string;
}

export interface DemoStore {
  products: CatalogProduct[];
  rates: DemoRate[];
  orders: DemoOrder[];
  enquiries: DemoEnquiry[];
  users: DemoUser[];
  settings: import("./settings").ShopSettings;
  rateSnapshots?: DemoRateSnapshot[];
  rateAudit?: DemoRateAudit[];
}

const DB_PATH = path.join(process.cwd(), ".data", "demo-db.json");

function seedOrders(): DemoOrder[] {
  const names = [
    ["Ritu Sharma", "ritu.sharma@example.com", "9876543210"],
    ["Mahesh Gupta", "mahesh.gupta@example.com", "9829012345"],
    ["Sunita Yadav", "sunita.yadav@example.com", "9785511223"],
    ["Ankit Jain", "ankit.jain@example.com", "9414078899"],
    ["Pooja Meena", "pooja.meena@example.com", "9828876543"],
    ["Vikas Agrawal", "vikas.agrawal@example.com", "9900112233"],
  ];
  const statuses = ["DELIVERED", "DELIVERED", "SHIPPED", "PACKED", "CONFIRMED", "PENDING"];
  const picks = [0, 6, 17, 3, 13, 12];
  const out: DemoOrder[] = [];
  for (let i = 0; i < 12; i++) {
    const p = catalogProducts[picks[i % picks.length]];
    const person = names[i % names.length];
    const daysAgo = i * 5 + 1;
    const created = new Date(Date.now() - daysAgo * 86400000);
    const metalValue = Math.round(p.weight * 6850);
    const making = Math.round((metalValue * p.makingPct) / 100);
    const subtotal = metalValue + p.gemstoneValue + making;
    const gst = Math.round(subtotal * 0.03);
    out.push({
      id: `demo-order-${i + 1}`,
      orderNumber: `JMD-2026-${1001 + i}`,
      email: person[1],
      phone: person[2],
      customerName: person[0],
      status: statuses[i % statuses.length],
      paymentStatus: i % 6 === 5 ? "PENDING" : "PAID",
      paymentMethod: i % 4 === 3 ? "STORE" : "ONLINE",
      fulfillment: i % 4 === 3 ? "PICKUP" : "DELIVERY",
      subtotal,
      gst,
      shipping: 0,
      total: subtotal + gst,
      goldRate: 6850,
      address: {
        fullName: person[0],
        phone: person[2],
        line1: "Near Bus Stand",
        city: "Hindaun",
        state: "Rajasthan",
        pincode: "322230",
      },
      items: [
        {
          slug: p.slug,
          name: p.name,
          image: p.images[0],
          size: p.sizes[0],
          quantity: 1,
          unitPrice: subtotal + gst,
          metalWeight: p.weight,
          gemstoneValue: p.gemstoneValue,
          makingCharges: making,
          gst,
        },
      ],
      createdAt: created.toISOString(),
    });
  }
  return out;
}

function seedDB(): DemoStore {
  return {
    products: JSON.parse(JSON.stringify(catalogProducts)),
    rates: defaultRates.map((r, i) => ({
      id: `rate-${i + 1}`,
      metal: r.metal,
      purity: r.purity,
      ratePerGram: r.ratePerGram,
      updatedAt: new Date().toISOString(),
      source: "MANUAL",
      status: "MANUAL",
      fetchedAt: null,
      feedRate: null,
    })),
    orders: seedOrders(),
    enquiries: [
      {
        id: "enq-1",
        name: "Kavita Saini",
        phone: "9876501234",
        message: "Do you have this emerald pendant with a heavier chain?",
        productSlug: "meera-emerald-pendant",
        productName: "Meera Emerald Pendant",
        type: "PRODUCT",
        status: "NEW",
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        id: "enq-2",
        name: "Rakesh Sharma",
        phone: "9812345678",
        message: "Coming on Sunday around 5 pm for a bridal set. Please keep options ready.",
        type: "STORE_VISIT",
        status: "CONTACTED",
        createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
      },
    ],
    users: [
      {
        id: "user-admin",
        name: "JMD Admin",
        email: process.env.SEED_ADMIN_EMAIL || "admin@jmdgems.in",
        role: "ADMIN",
        createdAt: new Date().toISOString(),
      },
      {
        id: "user-demo",
        name: "Ritu Sharma",
        email: "ritu.sharma@example.com",
        phone: "9876543210",
        role: "USER",
        createdAt: new Date().toISOString(),
      },
    ],
    settings: { ...DEFAULT_SETTINGS, festivalMode: true },
    rateSnapshots: [],
    rateAudit: [],
  };
}

let cache: DemoStore | null = null;

export function readDemo(): DemoStore {
  if (cache) return cache;
  try {
    if (fs.existsSync(DB_PATH)) {
      const parsed = JSON.parse(fs.readFileSync(DB_PATH, "utf8")) as DemoStore;
      // keep catalogue additions in sync with code
      if (!parsed.products?.length) parsed.products = JSON.parse(JSON.stringify(catalogProducts));
      if (!parsed.rates?.length) parsed.rates = seedDB().rates;
      parsed.settings = mergeSettings(parsed.settings);
      if (!Array.isArray(parsed.rateSnapshots)) parsed.rateSnapshots = [];
      if (!Array.isArray(parsed.rateAudit)) parsed.rateAudit = [];
      cache = parsed;
      return parsed;
    }
  } catch {
    // fall through to a fresh seed
  }
  cache = seedDB();
  writeDemo(cache);
  return cache;
}

export function writeDemo(next: DemoStore) {
  cache = next;
  try {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(next, null, 2), "utf8");
  } catch {
    // read-only filesystem (serverless) — keep the in-memory cache only
  }
}

export function newOrderNumber() {
  return orderNumber();
}
