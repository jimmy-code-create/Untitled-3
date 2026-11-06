# JMD Gems & Jewellery

Full-stack storefront for **JMD Gems & Jewellery**, Jagdamba Market, Mohan Nagar, Hindaun-322230, Rajasthan.

> Where Every Gem Tells a Story

A premium, Tanishq-style jewellery website with a warm local-shop personality: live gold/silver rates, BIS hallmarking and lab certificates, bridal collections, WhatsApp-first ordering, phone-OTP sign-in and a complete store dashboard.

---

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS, custom design tokens |
| Motion | Framer Motion, GSAP ScrollTrigger, Lenis smooth scroll |
| State | Zustand (cart, wishlist, toasts) |
| Data | Prisma + PostgreSQL |
| Auth | NextAuth (phone OTP credentials, admin credentials, Google OAuth) |
| Payments | Razorpay (UPI / cards) with signed webhook |
| Media | Cloudinary uploads (local `/public/uploads` fallback) |
| Validation | Zod on every API route |

## Quick start

```bash
npm install                 # installs deps and generates the Prisma client
cp .env.example .env.local  # fill in the values you need
npm run db:push             # create tables in PostgreSQL
npm run db:seed             # 20 products, rates, store info, admin user
npm run dev                 # http://localhost:3000
```

### Demo mode (no database required)

If `DATABASE_URL` is missing or unreachable, the app automatically falls back to a local JSON store at
`.data/demo-db.json`, seeded with the same 20 products, 12 sample orders and 2 enquiries. The whole site —
listing, filters, product pages, cart, checkout, account, admin dashboard and rate editor — works end to end.
Set `DATABASE_URL` and the repository layer switches to Postgres with no code changes.

Demo admin: **admin@jmdgems.in / JmdAdmin@2026** (override with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`).
Demo customer: sign in with mobile **9876543210** — that number is linked to the seeded order history, so the
account tabs (orders, tracking timeline, addresses) have real data to show.

Demo OTP: the `/api/auth/otp` endpoint returns `devCode` when `DEMO_MODE` is not `"false"`, and the login
screen displays it. Replace `sendOtp()` in `src/lib/otp.ts` with MSG91/Twilio and set `DEMO_MODE=false` before
going live.

## Environment

See [`.env.example`](.env.example). Only `NEXTAUTH_SECRET` is required to run; Razorpay, Cloudinary and Google
are optional and degrade gracefully:

- **No Razorpay keys** → checkout shows a clearly-labelled demo payment step (nothing is charged).
- **No Cloudinary keys** → admin uploads are written to `/public/uploads` (development only).
- **No Google keys** → the Google button is hidden automatically.

## Pages

| Route | What it does |
| --- | --- |
| `/` | Hero, collections, gemstone gallery, pinned bridal scroll, occasions, trending, testimonials, store visit |
| `/collections/[slug]` | `all`, `gold`, `silver`, `diamond`, `gemstones`, `bridal`, `gifting` — filters, sort, quick view, infinite scroll |
| `/products/[slug]` | Gallery with hover zoom + 360° viewer, server-priced breakup, sizes, pincode check, certificate PDF, WhatsApp enquiry, store-visit booking |
| `/cart` | Server-repriced cart, WhatsApp order message |
| `/checkout` | Address → delivery/pickup → Razorpay or cash-at-store |
| `/checkout/success` | Copper confetti, order summary, WhatsApp confirmation |
| `/account` | Orders, tracking timeline, wishlist, addresses |
| `/wishlist` | Locally saved pieces |
| `/visit` | Address, timings, both phone numbers, embedded map, services |
| `/login` | Phone OTP, admin sign-in, Google (when configured) |
| `/admin` | Role-protected dashboard: stats, sales chart, top pieces, recent orders |
| `/admin/products` | Create, edit, delete, multi-image upload, certificate upload |
| `/admin/orders` | Status updates and tracking numbers |
| `/admin/rates` | Gold/silver rate editor + festival-mode toggle |
| `/admin/enquiries` | WhatsApp/visit/newsletter leads with call & WhatsApp actions |
| `/admin/users` | Customer list |

## API

```
GET    /api/products            filters, sort, pagination
POST   /api/products            admin create
GET    /api/products/[slug]
PATCH  /api/products/[slug]     admin update
DELETE /api/products/[slug]     admin delete
POST   /api/cart/quote          server-side repricing
GET    /api/rates               public rates
PUT    /api/rates               admin update
POST   /api/orders              create order (totals computed server-side)
GET    /api/orders              signed-in customer / admin
PATCH  /api/orders/[id]         admin status + tracking
POST   /api/payments/create-order
POST   /api/payments/verify
POST   /api/payments/webhook    Razorpay HMAC signature check
POST   /api/auth/otp            send OTP (rate limited)
GET    /api/enquiries           admin
POST   /api/enquiries           product / store-visit / general
PATCH  /api/enquiries           admin status
POST   /api/newsletter
GET    /api/admin/stats
GET    /api/admin/settings
PATCH  /api/admin/settings      festival mode
GET    /api/admin/users
POST   /api/admin/upload        Cloudinary or local fallback
GET    /api/certificate/[slug]  generated authenticity PDF
```

## Pricing

The single source of truth is `src/lib/pricing.ts`:

```
price = (metal weight × live rate for the purity) + gemstone value + making charges + 3% GST
```

`goldValue = weight × rate`, `makingCharges = goldValue × makingPct / 100`, `gst = 3% of (goldValue + gemstoneValue + makingCharges)`.

Rates live in `MetalRate` (24K / 22K / 18K / Silver 92.5 / Silver 99.9) and are edited in `/admin/rates`.
Prices are **never** accepted from the browser — cart quotes, order creation, invoices and the product page all
recompute on the server from the database/catalogue.

## Design system

- Navy `#14112B` for dark sections (matches the signboard pill), copper rose-gold `#C98B6B`
  (gradient `#E3B08F → #A8694A`), ivory `#FBF6EE`, lavender `#E9E4F5`, marigold `#F29A2E` for festive accents.
- Cormorant Garamond headings, Inter body, Great Vibes for the "Gems & Jewellery" wordmark,
  Noto Sans Devanagari for Hindi.
- 1px copper dividers, sharp corners, grain overlay, copper ring cursor, curtain-lift loading screen.
- English / हिन्दी toggle (`src/lib/i18n.ts`) persisted in `localStorage`.

## SEO & accessibility

- JewelryStore + Product + WebSite schema.org JSON-LD with the Hindaun address and both phone numbers.
- Dynamic `sitemap.xml` and `robots.txt`, per-page metadata, canonical URLs.
- Semantic landmarks, focus-visible outlines, `aria-*` on toggles and icon buttons, reduced-motion respected.
- Local WebP images served through `next/image` with lazy loading.

## Project layout

```
prisma/schema.prisma      12 models incl. MetalRate, Enquiry, StoreInfo
prisma/seed.ts            20 products, categories, gemstones, rates, admin
src/lib/pricing.ts        money engine
src/lib/catalog.ts        seed catalogue + collections + gemstones + testimonials
src/lib/repo.ts           Prisma-first repository with JSON fallback
src/lib/demo-db.ts        demo persistence + sample orders
src/lib/auth.ts           NextAuth providers & callbacks
src/middleware.ts         admin/account route protection
src/components/…          brand, layout, home, product, cart, checkout, account, admin
```

## Security notes

- Admin APIs call `requireAdmin()` (session role check) in addition to middleware route protection.
- In-memory fixed-window rate limiting on OTP, orders, enquiries, newsletter and product reads.
- Zod validation on every mutating route; Razorpay signature + webhook HMAC verified with `crypto.timingSafe`-style comparison.
- Never commit `.env`. Keep the Razorpay secret, Cloudinary secret and `NEXTAUTH_SECRET` server-side only.

## Scripts

```bash
npm run dev        # dev server
npm run build      # prisma generate + production build
npm run start      # production server
npm run db:push    # sync schema
npm run db:seed    # seed data
npm run lint       # eslint
```
