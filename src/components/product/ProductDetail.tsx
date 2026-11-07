"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeCheck,
  CalendarClock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Heart,
  MapPin,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Truck,
  X,
} from "lucide-react";
import type { ProductView } from "@/lib/repo";
import { inr } from "@/lib/pricing";
import { LivePrice } from "@/components/rates/LivePrice";
import { useCart, useWishlist } from "@/store/cart";
import { useToast } from "@/store/toast";
import { usePageMeta } from "@/store/meta";
import { useLang } from "@/components/providers/LangProvider";
import { cn, fullAddress, waLink } from "@/lib/utils";
import { ProductCard } from "./ProductCard";

const SPEC_LABELS: Record<string, string> = {
  GOLD: "Gold",
  SILVER: "Silver",
  DIAMOND: "Diamond",
  GEMSTONE: "Gemstone",
};

function Accordion({ title, children, open = false }: { title: string; children: React.ReactNode; open?: boolean }) {
  const [isOpen, setIsOpen] = useState(open);
  return (
    <div className="border-b border-burgundy/12">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-center justify-between py-4 text-left text-[11px] uppercase tracking-[0.16em] text-charcoal/80"
        aria-expanded={isOpen}
      >
        {title}
        <ChevronDown className={cn("h-4 w-4 text-gold transition-transform duration-300", isOpen && "rotate-180")} strokeWidth={1.4} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-5 text-[12.5px] leading-relaxed text-bodygrey">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Product experience.
 *
 * Left: a transparent product stage — the photograph is blended into an ivory
 * panel (`mix-blend-multiply`) with a soft contact shadow under the piece, so
 * the jewellery reads as floating rather than sitting in a photo box. There is
 * a checkerboard "transparent" mode for a cut-out feel, a lightbox, and swipe
 * navigation on mobile.
 *
 * Right: everything a buyer at the counter would ask — live weight-priced
 * total, stock, size, quantity, certificate number, hallmarking, delivery
 * estimate and the full price breakup — followed by the story and related
 * pieces. No 3D viewer: real photographs, presented properly.
 */
export function ProductDetail({ product, related }: { product: ProductView; related: ProductView[] }) {
  const { t, isHi } = useLang();
  const [active, setActive] = useState(0);
  const [size, setSize] = useState(product.sizes[0] ?? "Free size");
  const [qty, setQty] = useState(1);
  const [origin, setOrigin] = useState("50% 50%");
  const [hovering, setHovering] = useState(false);
  const [transparent, setTransparent] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [pincode, setPincode] = useState("");
  const [pinResult, setPinResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [bookOpen, setBookOpen] = useState(false);
  const [bookState, setBookState] = useState<"idle" | "sending" | "done">("idle");
  const [form, setForm] = useState({ name: "", phone: "", date: "", message: "" });

  const add = useCart((s) => s.add);
  const push = useToast((s) => s.push);
  const wish = useWishlist();
  const setMeta = usePageMeta((s) => s.setProduct);
  const saved = wish.items.some((i) => i.slug === product.slug);

  const images = product.images.filter(Boolean);
  const shown = images.length ? images : ["/images/hero-necklace.webp"];

  useEffect(() => {
    setMeta(product.name, product.slug);
    return () => setMeta(null, null);
  }, [product.slug, product.name, setMeta]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") setActive((i) => (i + 1) % shown.length);
      if (e.key === "ArrowLeft") setActive((i) => (i - 1 + shown.length) % shown.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, shown.length]);

  const step = (dir: -1 | 1) => setActive((i) => (i + dir + shown.length) % shown.length);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  };

  const checkPincode = () => {
    if (!/^\d{6}$/.test(pincode)) {
      setPinResult({ ok: false, text: "Please enter a valid 6-digit pincode." });
      return;
    }
    const rajasthan = pincode.startsWith("3");
    setPinResult({
      ok: true,
      text: rajasthan
        ? "Delivered in 2–3 days from our Hindaun store · insured & fully tracked."
        : "Delivered in 3–5 working days · insured, signature required on delivery.",
    });
  };

  const submitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(form.phone)) {
      push("Check your number", "Enter a 10-digit mobile number.");
      return;
    }
    setBookState("sending");
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          message: `Store visit request for ${product.name}${form.date ? ` on ${form.date}` : ""}. ${form.message}`,
          productSlug: product.slug,
          type: "STORE_VISIT",
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setBookState("done");
      push("Visit requested", "Our team will call you to confirm the time.");
    } catch (error) {
      setBookState("idle");
      push("Could not send request", (error as Error).message);
    }
  };

  const addToCart = () => {
    add({
      slug: product.slug,
      name: product.name,
      image: shown[0],
      price: product.price,
      size,
      quantity: qty,
      metal: product.metal,
      purity: product.purity,
      weight: product.weight,
    });
    push("Added to bag", `${product.name} · ${size}${qty > 1 ? ` × ${qty}` : ""}`);
  };

  const specs: [string, string][] = [
    ["Metal", SPEC_LABELS[product.metal] ?? product.metal],
    ["Purity", product.purity],
    ["Gross weight", `${product.weight} g`],
    [
      product.gemstoneSlug === "diamond" ? "Diamonds" : "Gemstone",
      product.gemstoneSlug
        ? `${product.gemstoneSlug.replace("-", " ")}${product.gemstoneCarats ? ` · ${product.gemstoneCarats} ct` : ""}`
        : "None",
    ],
    ["Making charges", `${product.makingPct}% of metal value`],
    ["Sizes", product.sizes.length > 1 ? product.sizes.join(" · ") : "Free size"],
    ["Hallmark / certificate", `${product.certifications.join(" · ")} · ${product.certificateNo}`],
    ["Collection", product.collections.map((c) => c.replace("-", " ")).join(" · ")],
    ["Occasion", product.occasions.map((o) => o.replace("-", " ")).join(" · ") || "Everyday"],
  ];

  return (
    <div className="container-x">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:gap-14">
        {/* ─────────── gallery ─────────── */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          <div
            className={cn(
              "product-stage group relative aspect-[4/5] w-full overflow-hidden rounded-[2px]",
              transparent && "product-stage-clear",
            )}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active}
                initial={{ opacity: 0, scale: 1.015 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.995 }}
                transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0"
                onMouseEnter={() => setHovering(true)}
                onMouseLeave={() => setHovering(false)}
                onMouseMove={handleMove}
              >
                <Image
                  src={shown[active]}
                  alt={`${product.name} — ${product.purity} ${product.metal.toLowerCase()}, ${product.weight} grams`}
                  width={1200}
                  height={1500}
                  priority
                  sizes="(max-width: 1024px) 100vw, 620px"
                  className="product-shot h-full w-full object-cover transition-transform duration-500 ease-out"
                  style={{ transformOrigin: origin, transform: hovering ? "scale(1.55)" : "scale(1)" }}
                />
              </motion.div>
            </AnimatePresence>

            <span className="stage-shadow" aria-hidden />

            {/* badge + certificate chips */}
            <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1.5">
              {product.certifications.slice(0, 2).map((c) => (
                <span key={c} className="w-fit bg-black/80 px-2 py-1 text-[8.5px] font-semibold uppercase tracking-[0.14em] text-burgundy backdrop-blur">
                  {c}
                </span>
              ))}
            </div>

            {/* stage controls */}
            <div className="absolute right-2 top-2 flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => setTransparent((v) => !v)}
                aria-pressed={transparent}
                aria-label={transparent ? "Show the ivory stage" : "Show the piece on a transparent background"}
                className="grid h-11 w-11 place-items-center rounded-full bg-black/75 text-burgundy backdrop-blur transition-colors hover:bg-black"
                title="Transparent view"
              >
                <span className={cn("h-4 w-4 rounded-[3px] border border-burgundy/60", transparent ? "bg-[repeating-conic-gradient(#d9c9bc_0%_25%,transparent_0%_50%)] bg-[length:8px_8px]" : "bg-transparent")} />
              </button>
              <button
                type="button"
                onClick={() => setLightbox(true)}
                aria-label="Open full-size photograph"
                className="grid h-11 w-11 place-items-center rounded-full bg-black/75 text-burgundy backdrop-blur transition-colors hover:bg-black"
              >
                <Plus className="h-4 w-4" strokeWidth={1.6} />
              </button>
            </div>

            {shown.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Previous photograph"
                  className="absolute left-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-cream/80 text-burgundy opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Next photograph"
                  className="absolute right-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-cream/80 text-burgundy opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            ) : null}

            <span className="absolute bottom-3 left-3 text-[9px] uppercase tracking-[0.18em] text-burgundy/70">
              {active + 1} / {shown.length} · Hindaun store photograph
            </span>
          </div>

          {/* thumb rail */}
          {shown.length > 1 ? (
            <div className="mt-2.5 flex gap-2 overflow-x-auto no-scrollbar">
              {shown.map((img, i) => (
                <button
                  key={img + i}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Show photograph ${i + 1}`}
                  aria-pressed={active === i}
                  className={cn(
                    "relative h-20 w-16 shrink-0 overflow-hidden rounded-[2px] border transition-colors",
                    active === i ? "border-burgundy" : "border-white/10 hover:border-white/25",
                  )}
                >
                  <Image src={img} alt="" width={120} height={150} sizes="64px" className="product-shot h-full w-full object-cover" />
                </button>
              ))}
            </div>
          ) : null}

          {/* trust strip */}
          <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 border-y border-white/10 py-3 text-[10px] text-bodygrey sm:grid-cols-4">
            <span className="flex items-center gap-1.5">
              <BadgeCheck className="h-3.5 w-3.5 text-gold-dark" strokeWidth={1.5} /> BIS hallmarked
            </span>
            <span className="flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5 text-gold-dark" strokeWidth={1.5} /> Insured delivery
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-gold-dark" strokeWidth={1.5} /> 15-day return
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarClock className="h-3.5 w-3.5 text-gold-dark" strokeWidth={1.5} /> Free resizing
            </span>
          </div>
        </div>

        {/* ─────────── buy panel ─────────── */}
        <div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.14em] text-bodygrey">
            <span className="text-burgundy">{product.purity}</span>
            <span className="h-1 w-1 rounded-full bg-gold/60" aria-hidden />
            <span>{SPEC_LABELS[product.metal] ?? product.metal}</span>
            {product.gemstoneSlug ? (
              <>
                <span className="h-1 w-1 rounded-full bg-gold/60" aria-hidden />
                <span className="capitalize">{product.gemstoneSlug.replace("-", " ")}</span>
              </>
            ) : null}
            <span className="h-1 w-1 rounded-full bg-gold/60" aria-hidden />
            <span>{product.weight} g</span>
          </div>

          <h1 className="mt-2.5 font-serif text-[30px] leading-[1.08] text-ink sm:text-[38px]">{product.name}</h1>
          <p className="mt-1 font-hindi text-[13px] text-bodygrey">{product.nameHi}</p>
          <p className="mt-2 text-[13px] leading-relaxed text-bodygrey">{product.subtitle}</p>

          <div className="mt-5">
            <LivePrice
              metal={product.metal}
              purity={product.purity}
              weight={product.weight * qty}
              makingPct={product.makingPct}
              gemstoneValue={product.gemstoneValue * qty}
              size="lg"
            />
            <p className="mt-1.5 text-[10.5px] text-bodygrey">
              Inclusive of GST · {product.weight} g {product.purity} at today’s rate, so the total moves with the bhav.
            </p>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
            {product.stock > 0 ? (
              <span className={cn("font-semibold", product.stock <= 2 ? "text-[#B3261E]" : "text-whatsapp")}>
                {product.stock <= 2 ? `Only ${product.stock} left in the store` : `In stock · ${product.stock} pieces`}
              </span>
            ) : (
              <span className="text-bodygrey">Made to order · 7–10 days</span>
            )}
            <span className="text-bodygrey">·</span>
            <a
              href={`/api/certificate/${product.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-burgundy underline decoration-gold/40 underline-offset-4"
            >
              <Download className="h-3 w-3" /> Certificate
            </a>
          </div>

          {product.sizes.length > 1 ? (
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between">
                <p className="label">{t("product.size")}</p>
                <span className="text-[10px] text-bodygrey">Free resizing in store</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    aria-pressed={size === s}
                    className={cn(
                      "min-h-11 min-w-[56px] rounded-control border px-3 text-[11.5px] transition-colors",
                      size === s
                        ? "border-burgundy bg-white text-black"
                        : "border-white/15 text-charcoal/80 hover:border-burgundy",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-5 flex items-center gap-3">
            <div className="inline-flex items-center rounded-control border border-white/15">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="grid h-11 w-11 place-items-center text-burgundy disabled:opacity-40"
                disabled={qty <= 1}
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="rate-digits w-8 text-center text-[13px] text-ink">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(9, q + 1))}
                aria-label="Increase quantity"
                className="grid h-11 w-11 place-items-center text-burgundy disabled:opacity-40"
                disabled={qty >= 9}
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <button
              type="button"
              onClick={() =>
                wish.toggle({
                  slug: product.slug,
                  name: product.name,
                  image: shown[0],
                  price: product.price,
                  metal: product.metal,
                })
              }
              aria-pressed={saved}
              aria-label={saved ? "Remove from saved pieces" : "Save this piece"}
              className={cn(
                "grid h-11 w-11 place-items-center rounded-control border transition-colors",
                saved ? "border-burgundy text-burgundy" : "border-white/15 text-charcoal/70 hover:border-burgundy",
              )}
            >
              <Heart className={cn("h-4 w-4", saved && "fill-burgundy")} strokeWidth={1.5} />
            </button>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <button type="button" onClick={addToCart} className="btn-copper w-full">
              <ShoppingBag className="h-4 w-4" strokeWidth={1.5} /> {t("product.addToCart")}
            </button>
            <a
              href={waLink(
                `Namaste JMD Gems & Jewellery 🙏\n\nI'm interested in *${product.name}* (${product.purity} ${
                  SPEC_LABELS[product.metal]
                }, ${product.weight}g) — ${inr(product.price)}.\n${product.slug}\n\nPlease share the best price and availability.${
                  product.certificateNo ? `\nCertificate: ${product.certificateNo}` : ""
                }`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp w-full"
            >
              <svg viewBox="0 0 32 32" className="h-4 w-4 fill-current" aria-hidden>
                <path d="M16.04 3.2c-7.06 0-12.8 5.73-12.8 12.8 0 2.26.59 4.47 1.71 6.42L3.2 28.8l6.56-1.72a12.75 12.75 0 0 0 6.28 1.63h.01c7.06 0 12.8-5.74 12.8-12.8 0-3.42-1.33-6.63-3.75-9.05a12.7 12.7 0 0 0-9.06-3.66Z" />
              </svg>
              {t("product.buyWhatsapp")}
            </a>
          </div>
          <button onClick={() => setBookOpen(true)} className="btn-outline mt-2 w-full">
            <CalendarClock className="h-4 w-4" strokeWidth={1.4} /> {t("product.bookVisit")}
          </button>

          {/* delivery */}
          <div className="mt-5 border border-burgundy/12 bg-white/[0.04] p-4">
            <p className="label mb-2.5">{t("product.pincode")}</p>
            <div className="flex gap-2">
              <input
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder={t("product.pincodePlaceholder")}
                inputMode="numeric"
                className="field py-2.5 text-xs"
                aria-label="Pincode"
              />
              <button onClick={checkPincode} className="btn-navy shrink-0 px-4 py-2.5 text-[10px]">
                Check
              </button>
            </div>
            {pinResult && (
              <p className={cn("mt-2.5 flex items-start gap-1.5 text-[11px]", pinResult.ok ? "text-whatsapp" : "text-[#B3261E]")}>
                <MapPin className="mt-0.5 h-3 w-3 shrink-0" strokeWidth={1.6} /> {pinResult.text}
              </p>
            )}
            <p className="mt-2 flex items-center gap-1.5 text-[10.5px] text-bodygrey">
              <Truck className="h-3 w-3" strokeWidth={1.4} /> Free insured shipping above ₹25,000 · store pickup available
            </p>
          </div>

          {/* full specification */}
          <div className="mt-6">
            <p className="label mb-2.5">{isHi ? "पूरी जानकारी" : "The details"}</p>
            <dl className="grid gap-x-5 gap-y-0 border-t border-white/10">
              {specs.map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 border-b border-white/10 py-2">
                  <dt className="text-[11.5px] text-bodygrey">{label}</dt>
                  <dd className="max-w-[62%] text-right text-[11.5px] capitalize text-charcoal">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* price breakup */}
          <details className="mt-4 border border-burgundy/12 bg-white/[0.04] p-4">
            <summary className="label cursor-pointer list-none">{t("product.priceBreakup")}</summary>
            <dl className="mt-3 space-y-2 text-[12px]">
              <div className="flex justify-between text-bodygrey">
                <dt>
                  {t("product.goldValue")} · {product.weight}g × {inr(product.breakup.ratePerGram)}
                </dt>
                <dd className="text-charcoal">{inr(product.breakup.metalValue)}</dd>
              </div>
              {product.gemstoneValue > 0 && (
                <div className="flex justify-between text-bodygrey">
                  <dt>
                    {t("product.gemValue")}
                    {product.gemstoneCarats ? ` · ${product.gemstoneCarats}ct` : ""}
                  </dt>
                  <dd className="text-charcoal">{inr(product.gemstoneValue)}</dd>
                </div>
              )}
              <div className="flex justify-between text-bodygrey">
                <dt>
                  {t("product.making")} ({product.makingPct}%)
                </dt>
                <dd className="text-charcoal">{inr(product.breakup.makingCharges)}</dd>
              </div>
              <div className="flex justify-between text-bodygrey">
                <dt>{t("product.gst")}</dt>
                <dd className="text-charcoal">{inr(product.breakup.gst)}</dd>
              </div>
              <div className="flex justify-between border-t border-burgundy/12 pt-2.5">
                <dt className="text-[10px] uppercase tracking-[0.16em] text-gold-dark">{t("product.total")}</dt>
                <dd className="font-serif text-lg text-ink">{inr(product.price)}</dd>
              </div>
            </dl>
            <p className="mt-3 flex items-center gap-1.5 text-[10px] text-bodygrey">
              <ShieldCheck className="h-3 w-3" strokeWidth={1.4} /> Calculated against today’s Hindaun rate; the live price above updates
              with the bhav.
            </p>
          </details>

          <div className="mt-6">
            <Accordion title={t("product.details")} open>
              <p>{product.description}</p>
            </Accordion>
            <Accordion title={t("product.story")}>
              <p className="italic">“{product.story}”</p>
            </Accordion>
            <Accordion title="Care & delivery">
              <p>
                Store in the pouch provided, away from perfume. Free polish and re-stringing for life. Insured, fully tracked
                delivery across India; store pickup at {fullAddress}.
              </p>
            </Accordion>
          </div>
        </div>
      </div>

      {/* lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="fixed inset-0 z-[95] flex items-center justify-center bg-burgundy-deep/95 p-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(false)}
            role="dialog"
            aria-modal="true"
            aria-label={`${product.name} photograph`}
          >
            <button
              onClick={() => setLightbox(false)}
              aria-label="Close photograph"
              className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-cream/10 text-cream hover:bg-cream/20"
            >
              <X className="h-5 w-5" />
            </button>
            <motion.div
              key={active}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative h-[80vh] w-full max-w-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image src={shown[active]} alt={`${product.name} full size`} fill sizes="90vw" className="object-contain" />
            </motion.div>
            {shown.length > 1 ? (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    step(-1);
                  }}
                  aria-label="Previous photograph"
                  className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-cream/10 text-cream hover:bg-cream/20"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    step(1);
                  }}
                  aria-label="Next photograph"
                  className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-cream/10 text-cream hover:bg-cream/20"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      {/* book visit */}
      <AnimatePresence>
        {bookOpen && (
          <motion.div
            className="fixed inset-0 z-[95] flex items-center justify-center bg-navy/60 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setBookOpen(false)}
          >
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-black p-6 sm:p-8"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="label mb-2">Store visit</p>
                  <h3 className="font-serif text-2xl text-white">See it in person</h3>
                </div>
                <button onClick={() => setBookOpen(false)} aria-label="Close" className="text-stone hover:text-charcoal">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="mt-2 text-[11.5px] text-stone">
                {product.name} · {fullAddress}
              </p>

              {bookState === "done" ? (
                <div className="mt-6 border border-whatsapp/30 bg-whatsapp/5 p-5 text-center">
                  <BadgeCheck className="mx-auto h-8 w-8 text-whatsapp" strokeWidth={1.3} />
                  <p className="mt-2 font-serif text-xl text-white">Request received</p>
                  <p className="mt-1 text-[11.5px] text-stone">We will call you shortly to confirm your visit.</p>
                </div>
              ) : (
                <form onSubmit={submitBooking} className="mt-5 space-y-3">
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name"
                    className="field"
                  />
                  <input
                    required
                    inputMode="numeric"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                    placeholder="Mobile number"
                    className="field"
                  />
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="field text-stone"
                  />
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Anything we should keep ready?"
                    rows={3}
                    className="field resize-none"
                  />
                  <button type="submit" disabled={bookState === "sending"} className="btn-copper w-full">
                    {bookState === "sending" ? "Sending…" : "Request a visit"}
                  </button>
                  <p className="text-center text-[10px] text-stone">Or call +91 7891384376 · 10:30 am – 8:30 pm</p>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {related.length > 0 && (
        <section className="mt-20 border-t border-burgundy/12 pt-12">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="label mb-2">{isHi ? "और भी देखें" : "Complete the look"}</p>
              <h2 className="h2 text-white">{t("product.similar")}</h2>
            </div>
            <Link
              href={`/collections/${product.collections[0] ?? "all"}`}
              className="hidden text-[10px] uppercase tracking-widest2 text-burgundy sm:block"
            >
              View collection
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {related.slice(0, 4).map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
