/**
 * Admin flow smoke test: signs in with the admin credentials provider,
 * then exercises dashboard pages and a rate change.
 *
 *   node scripts/smoke-admin.mjs [baseUrl]
 */
const base = process.argv[2] || "http://127.0.0.1:3000";
const jar = new Map();
let failures = 0;

function cookieHeader() {
  return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}

function storeCookies(res) {
  const raw = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
  for (const line of raw) {
    const [pair] = line.split(";");
    const idx = pair.indexOf("=");
    if (idx > 0) jar.set(pair.slice(0, idx), pair.slice(idx + 1));
  }
}

async function req(path, init = {}) {
  const res = await fetch(base + path, {
    ...init,
    redirect: "manual",
    headers: { ...(init.headers || {}), cookie: cookieHeader() },
  });
  storeCookies(res);
  return res;
}

async function check(label, fn) {
  try {
    const value = await fn();
    console.log(`✓ ${label}${value ? ` — ${value}` : ""}`);
  } catch (error) {
    failures += 1;
    console.log(`✗ ${label} — ${error.message}`);
  }
}

// 1. CSRF
const csrfRes = await req("/api/auth/csrf");
const { csrfToken } = await csrfRes.json();
if (!csrfToken) {
  console.log("✗ could not obtain CSRF token");
  process.exit(1);
}

// 2. Admin credentials sign-in
const body = new URLSearchParams({
  csrfToken,
  email: "admin@jmdgems.in",
  password: "JmdAdmin@2026",
  callbackUrl: base + "/admin",
  json: "true",
});
const loginRes = await req("/api/auth/callback/admin", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body,
});
const sessionRes = await req("/api/auth/session");
const session = await sessionRes.json();
const loginOk = Boolean(session?.user?.email);
console.log(loginOk ? `✓ admin sign-in — ${session.user.email} (${session.user.role})` : "✗ admin sign-in failed");
if (!loginOk) failures += 1;

// 3. Dashboard pages
await check("GET /admin", async () => {
  const res = await req("/admin");
  if (res.status !== 200) throw new Error(`status ${res.status}`);
  const html = await res.text();
  if (!html.includes("Namaste, JMD family")) throw new Error("dashboard content missing");
  return "200";
});

for (const path of ["/admin/products", "/admin/orders", "/admin/rates", "/admin/enquiries", "/admin/users"]) {
  await check(`GET ${path}`, async () => {
    const res = await req(path);
    if (res.status !== 200) throw new Error(`status ${res.status}`);
    const html = await res.text();
    if (html.length < 2000) throw new Error("suspiciously small page");
    return "200";
  });
}

await check("GET /api/admin/stats", async () => {
  const res = await req("/api/admin/stats");
  const data = await res.json();
  if (!data.ok || typeof data.stats.revenue !== "number") throw new Error("bad payload");
  return `₹${data.stats.revenue} · ${data.stats.orderCount} orders`;
});

await check("GET /api/admin/users", async () => {
  const res = await req("/api/admin/users");
  const data = await res.json();
  if (!data.ok || !data.users.length) throw new Error("no users");
  return `${data.users.length} users`;
});

// 4. Festival mode toggle round-trip
await check("PATCH /api/admin/settings (festival)", async () => {
  const before = await (await req("/api/admin/settings")).json();
  const next = !before.settings.festivalMode;
  const res = await req("/api/admin/settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ festivalMode: next }),
  });
  const data = await res.json();
  if (!data.ok || data.settings.festivalMode !== next) throw new Error("toggle failed");
  await req("/api/admin/settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ festivalMode: before.settings.festivalMode }),
  });
  return `${next ? "on" : "off"} → restored`;
});

// 5. Rate change must move the product price
const priceBefore = (await (await fetch(base + "/api/products?q=noor")).json()).products[0].price;

await check("PUT /api/rates updates prices", async () => {
  const res = await req("/api/rates", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ updates: [{ purity: "18K", ratePerGram: 6000 }] }),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error);
  const priceAfter = (await (await fetch(base + "/api/products?q=noor")).json()).products[0].price;
  if (priceAfter === priceBefore) throw new Error("price did not change");
  await req("/api/rates", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ updates: [{ purity: "18K", ratePerGram: 5610 }] }),
  });
  return `₹${priceBefore} → ₹${priceAfter} → restored`;
});

// 6. Order status update
await check("PATCH /api/orders/[id] status", async () => {
  const list = await (await req("/api/orders")).json();
  const order = list.orders[0];
  const res = await req(`/api/orders/${order.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "PACKED", trackingNo: "JMD-TEST-1", courier: "Delhivery" }),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error);
  return `${order.orderNumber} → PACKED`;
});

console.log(failures === 0 ? "\nADMIN CHECKS PASSED" : `\n${failures} ADMIN CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
