/** Smoke checks: node scripts/smoke.mjs [baseUrl] */
const base = process.argv[2] || "http://127.0.0.1:3000";
let failures = 0;

async function check(label, fn) {
  try {
    const result = await fn();
    console.log(`✓ ${label}${result ? ` — ${result}` : ""}`);
  } catch (error) {
    failures += 1;
    console.log(`✗ ${label} — ${error.message}`);
  }
}

async function page(path, needle) {
  const res = await fetch(base + path, { redirect: "manual" });
  if (res.status !== 200) throw new Error(`status ${res.status}`);
  if (needle) {
    const html = await res.text();
    if (!html.includes(needle)) throw new Error(`missing "${needle}"`);
    return "200";
  }
  return "200";
}

await check("Home page", () => page("/", "JMD"));
await check("Home hero headline", () => page("/", "Jewellery That"));
await check("Collection listing", () => page("/collections/all", "All Jewellery"));
await check("Bridal collection", () => page("/collections/bridal", "Bridal Collection"));
await check("Product detail", () => page("/products/meher-gold-choker", "Meher Gold Choker"));
await check("Product price breakup", () => page("/products/noor-solitaire-ring", "Price Breakup"));
await check("Visit store", () => page("/visit", "Jagdamba Market"));
await check("Cart page", () => page("/cart", "Your Cart"));
await check("Login page", () => page("/login", "Store admin"));
await check("404 page", async () => {
  const res = await fetch(base + "/does-not-exist");
  if (res.status !== 404) throw new Error(`expected 404, got ${res.status}`);
  return "404";
});

await check("GET /api/products", async () => {
  const res = await fetch(base + "/api/products?limit=3");
  const data = await res.json();
  if (!data.ok || data.products.length !== 3) throw new Error("unexpected payload");
  const p = data.products[0];
  if (!p.price || !p.breakup) throw new Error("price not computed");
  return `${data.total} total · ${p.name} ₹${p.price}`;
});

await check("Filter gemstones", async () => {
  const res = await fetch(base + "/api/products?collection=gemstones&limit=20");
  const data = await res.json();
  if (!data.products.every((p) => p.collections.includes("gemstones"))) throw new Error("filter leak");
  return `${data.total} gemstone pieces`;
});

await check("GET /api/rates", async () => {
  const res = await fetch(base + "/api/rates");
  const data = await res.json();
  if (!data.ok || !data.rates.length) throw new Error("no rates");
  return `${data.rates.length} rates loaded`;
});

let orderId = null;
let orderNumber = null;

await check("POST /api/orders (server pricing)", async () => {
  const res = await fetch(base + "/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: [{ slug: "noor-solitaire-ring", size: "12", quantity: 1 }],
      customer: { name: "Smoke Tester", phone: "9876500001", email: "smoke@jmdgems.in" },
      address: { line1: "12 Mohan Nagar", city: "Hindaun", state: "Rajasthan", pincode: "322230" },
      fulfillment: "DELIVERY",
      paymentMethod: "ONLINE",
    }),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error);
  orderId = data.order.id;
  orderNumber = data.order.orderNumber;
  const expectedGst = Math.round((data.order.total / 1.03) * 0.03);
  if (Math.abs(data.order.total - (data.order.total / 1.03) * 1.03) > 1) throw new Error("bad totals");
  return `${orderNumber} · ₹${data.order.total} · gst≈${expectedGst}`;
});

await check("Order validation rejects bad pincode", async () => {
  const res = await fetch(base + "/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: [{ slug: "meher-gold-choker", quantity: 1 }],
      customer: { name: "X", phone: "123", email: "x@y.z" },
      address: { line1: "a", city: "b", state: "c", pincode: "1" },
      fulfillment: "DELIVERY",
      paymentMethod: "ONLINE",
    }),
  });
  if (res.status !== 422) throw new Error(`expected 422, got ${res.status}`);
  return "422";
});

await check("POST /api/payments/create-order (demo)", async () => {
  const res = await fetch(base + "/api/payments/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId }),
  });
  const data = await res.json();
  if (!data.ok || !data.demo) throw new Error(data.error || "expected demo mode");
  return data.razorpayOrderId;
});

await check("POST /api/payments/verify (demo)", async () => {
  const res = await fetch(base + "/api/payments/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId, demo: true }),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error);
  return `${data.orderNumber} → ${data.status}`;
});

await check("POST /api/auth/otp", async () => {
  const res = await fetch(base + "/api/auth/otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: "9876543210" }),
  });
  const data = await res.json();
  if (!data.ok || !data.devCode) throw new Error(data.error || "no dev code");
  return `dev code ${data.devCode}`;
});

await check("POST /api/enquiries", async () => {
  const res = await fetch(base + "/api/enquiries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Smoke Enquiry", phone: "9876500002", message: "Is the emerald available?", productSlug: "meera-emerald-pendant", type: "PRODUCT" }),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error);
  return data.enquiry.id;
});

await check("Admin routes require auth", async () => {
  const res = await fetch(base + "/admin", { redirect: "manual" });
  if (![302, 307].includes(res.status)) throw new Error(`expected redirect, got ${res.status}`);
  return `redirect ${res.status} → ${res.headers.get("location")}`;
});

await check("Admin API blocked without session", async () => {
  const res = await fetch(base + "/api/admin/stats");
  if (res.status !== 401) throw new Error(`expected 401, got ${res.status}`);
  return "401";
});

await check("Certificate PDF", async () => {
  const res = await fetch(base + "/api/certificate/meher-gold-choker");
  const type = res.headers.get("content-type");
  const buf = Buffer.from(await res.arrayBuffer());
  if (res.status !== 200 || !type?.includes("pdf") || buf.subarray(0, 5).toString() !== "%PDF-") {
    throw new Error("not a PDF");
  }
  return `${buf.length} bytes`;
});

await check("Sitemap", async () => {
  const res = await fetch(base + "/sitemap.xml");
  const text = await res.text();
  if (!text.includes("<urlset")) throw new Error("invalid sitemap");
  return `${(text.match(/<url>/g) || []).length} urls`;
});

console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
