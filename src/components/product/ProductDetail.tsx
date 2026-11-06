"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeCheck,
  CalendarClock,
  ChevronDown,
  Download,
  Heart,
  MapPin,
  Maximize2,
  RotateCw,
  ShieldCheck,
  Truck,
  X,
} from "lucide-react";
import type { ProductView } from "@/lib/repo";
import { inr } from "@/lib/pricing";
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
    <div className="border-b border-copper/15">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-center justify-between py-4 text-left text-[11px] uppercase tracking-widest2 text-charcoal/80"
        aria-expanded={isOpen}
      >
        {title}
        <ChevronDown className={cn("h-4 w-4 text-copper transition-transform", isOpen && "rotate-180")} strokeWidth={1.4} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="overflow-hidden"
          >
            <div className="pb-5 text-[12.5px] leading-relaxed text-stone">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ProductDetail({ product, related }: { product: ProductView; related: ProductView[] }) {
  const { t, isHi } = useLang();
  const [active, setActive] = useState(0);
  const [size, setSize] = useState(product.sizes[0] ?? "Free size");
  const [origin, setOrigin] = useState("50% 50%");
  const [hovering, setHovering] = useState(false);
  const [viewer360, setViewer360] = useState(false);
  const [frame, setFrame] = useState(0);
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
  const dragRef = useRef<{ x: number; start: number } | null>(null);

  useEffect(() => {
    setMeta(product.name, product.slug);
    return () => setMeta(null, null);
  }, [product.slug, product.name, setMeta]);

  const frames = [...product.images, ...product.images].slice(0, 8);

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
      image: product.images[0],
      price: product.price,
      size,
      quantity: 1,
      metal: product.metal,
      purity: product.purity,
      weight: product.weight,
    });
    push("Added to cart", `${product.name} · ${size}`);
  };

  return (
    <div className="container-x">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        {/* Gallery */}
        <div>
          <div className="flex gap-3">
            <div className="order-2 flex flex-row gap-2.5 lg:order-1 lg:flex-col">
              {product.images.map((img, i) => (
                <button
                  key={img + i}
                  onClick={() => setActive(i)}
                  className={cn(
                    "relative h-16 w-14 shrink-0 overflow-hidden border transition-colors sm:h-20 sm:w-16",
                    active === i ? "border-copper" : "border-copper/20 hover:border-copper/50",
                  )}
                  aria-label={`View image ${i + 1}`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} — photo ${i + 1}`}
                    width={120}
                    height={150}
                    sizes="64px"
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
              <button
                onClick={() => setViewer360(true)}
                className="flex h-16 w-14 shrink-0 flex-col items-center justify-center gap-1 border border-copper/20 text-copper-dark transition-colors hover:border-copper sm:h-20 sm:w-16"
                aria-label="Open 360 view"
              >
                <RotateCw className="h-4 w-4" strokeWidth={1.3} />
                <span className="text-[7.5px] uppercase tracking-widest2">360°</span>
              </button>
            </div>

            <div
              className="group relative order-1 aspect-[4/5] flex-1 overflow-hidden bg-ivorydim lg:order-2"
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => setHovering(false)}
              onMouseMove={handleMove}
            >
              <Image
                src={product.images[active]}
                alt={`${product.name} — ${product.purity} ${product.metal.toLowerCase()}, ${product.weight} grams`}
                width={1200}
                height={1500}
                priority
                sizes="(max-width: 1024px) 100vw, 560px"
                className="h-full w-full object-cover transition-transform duration-300 ease-out"
                style={{ transformOrigin: origin, transform: hovering ? "scale(1.75)" : "scale(1)" }}
              />
              <button
                onClick={() => setViewer360(true)}
                className="absolute right-3 top-3 flex items-center gap-1.5 bg-ivory/90 px-2.5 py-1.5 text-[8.5px] uppercase tracking-widest2 text-navy backdrop-blur transition-colors hover:bg-white"
              >
                <Maximize2 className="h-3 w-3" strokeWidth={1.5} /> 360°
              </button>
              <div className="absolute bottom-3 left-3 flex gap-1.5">
                {product.certifications.map((c) => (
                  <span key={c} className="bg-navy/85 px-2 py-1 text-[8px] uppercase tracking-widest2 text-copper-light backdrop-blur">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <p className="mt-3 text-center text-[10px] text-stone lg:text-left">
            Photos are representative. Ask on WhatsApp for a photo of the piece in stock today.
          </p>
        </div>

        {/* Buy panel */}
        <div>
          <div className="lg:sticky lg:top-6">
            <div className="flex flex-wrap items-center gap-2">
              {product.badges.map((b) => (
                <span key={b} className="bg-copper/10 px-2.5 py-1 text-[9px] uppercase tracking-widest2 text-copper-dark">
                  {b}
                </span>
              ))}
              <span className="text-[9px] uppercase tracking-widest2 text-stone">
                {product.stock > 3 ? t("product.inStock") : product.stock > 0 ? t("product.lowStock") : t("product.outOfStock")}
              </span>
            </div>

            <h1 className="mt-4 font-serif text-4xl leading-tight text-navy sm:text-[2.9rem]">{product.name}</h1>
            <p className="mt-1 font-hindi text-[13px] text-stone">{product.nameHi}</p>
            <p className="mt-3 text-[13px] leading-relaxed text-stone">{product.subtitle}</p>

            <div className="mt-6 flex flex-wrap items-end gap-3">
              <span className="font-serif text-3xl text-navy">{inr(product.price)}</span>
              <span className="pb-1 text-[13px] text-stone line-through">{inr(product.mrp)}</span>
              <span className="mb-0.5 border border-marigold/60 px-2 py-1 text-12 uppercase tracking-label text-charcoal">
                Save {inr(product.mrp - product.price)}
              </span>
            </div>
            <p className="mt-1.5 text-[10.5px] text-stone">
              Inclusive of all taxes · Rate today {inr(product.breakup.ratePerGram)}/g for {product.purity}
            </p>

            {product.sizes.length > 1 && (
              <div className="mt-7">
                <div className="mb-2.5 flex items-center justify-between">
                  <p className="label">{t("product.size")}</p>
                  <span className="text-[10px] text-stone">Free resizing in store</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={cn(
                        "min-w-[52px] border px-3 py-2 text-[11px] transition-colors",
                        size === s ? "border-copper bg-copper text-white" : "border-copper/30 text-charcoal/75 hover:border-copper",
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-7 grid gap-2.5 sm:grid-cols-[1fr_auto]">
              <button onClick={addToCart} className="btn-copper w-full">
                {t("product.addToCart")}
              </button>
              <button
                onClick={() =>
                  wish.toggle({
                    slug: product.slug,
                    name: product.name,
                    image: product.images[0],
                    price: product.price,
                    metal: product.metal,
                  })
                }
                aria-pressed={saved}
                className={cn(
                  "btn border px-4",
                  saved ? "border-ruby/40 text-ruby" : "border-copper/40 text-copper-dark hover:bg-copper/10",
                )}
              >
                <Heart className={cn("h-4 w-4", saved && "fill-ruby")} strokeWidth={1.5} />
                <span className="sm:hidden">{saved ? t("product.wishlisted") : t("product.wishlist")}</span>
              </button>
            </div>

            <a
              href={waLink(
                `Namaste JMD Gems & Jewellery 🙏\n\nI'm interested in *${product.name}* (${product.purity} ${SPEC_LABELS[product.metal]}, ${product.weight}g) — ${inr(product.price)}.\n${product.slug}\n\nPlease share the best price and availability.${
                  product.certificateNo ? `\nCertificate: ${product.certificateNo}` : ""
                }`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp mt-2.5 w-full"
            >
              <svg viewBox="0 0 32 32" className="h-4 w-4 fill-current" aria-hidden>
                <path d="M16.04 3.2c-7.06 0-12.8 5.73-12.8 12.8 0 2.26.59 4.47 1.71 6.42L3.2 28.8l6.56-1.72a12.75 12.75 0 0 0 6.28 1.63h.01c7.06 0 12.8-5.74 12.8-12.8 0-3.42-1.33-6.63-3.75-9.05a12.7 12.7 0 0 0-9.06-3.66Z" />
              </svg>
              {t("product.buyWhatsapp")}
            </a>
            <button onClick={() => setBookOpen(true)} className="btn-outline mt-2.5 w-full">
              <CalendarClock className="h-4 w-4" strokeWidth={1.4} /> {t("product.bookVisit")}
            </button>

            {/* Pincode */}
            <div className="mt-6 border border-copper/20 bg-white p-4">
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
                <p className={cn("mt-2.5 flex items-start gap-1.5 text-[11px]", pinResult.ok ? "text-whatsapp" : "text-ruby")}>
                  <MapPin className="mt-0.5 h-3 w-3 shrink-0" strokeWidth={1.6} /> {pinResult.text}
                </p>
              )}
              <p className="mt-2 flex items-center gap-1.5 text-[10.5px] text-stone">
                <Truck className="h-3 w-3" strokeWidth={1.4} /> Free insured shipping above ₹25,000 · Store pickup available
              </p>
            </div>

            {/* Certifications */}
            <div className="mt-4 border border-copper/20 bg-lilacsoft/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="flex items-center gap-2 text-[10px] uppercase tracking-widest2 text-copper-dark">
                  <BadgeCheck className="h-4 w-4" strokeWidth={1.4} /> {t("product.certified")}
                </p>
                <a
                  href={`/api/certificate/${product.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest2 text-navy underline decoration-copper/40 underline-offset-4"
                >
                  <Download className="h-3 w-3" /> {t("product.certificate")}
                </a>
              </div>
              <p className="mt-2 text-[11px] text-stone">
                {product.certifications.join(" · ")} · Cert. no. <span className="text-charcoal">{product.certificateNo}</span>
              </p>
            </div>

            {/* Price breakup */}
            <details className="mt-4 rounded-card border border-burgundy/15 bg-white p-4">
              <summary className="label cursor-pointer list-none">{t("product.priceBreakup")}</summary>
              <dl className="mt-3 space-y-2 text-[12px]">
                <div className="flex justify-between text-stone">
                  <dt>
                    {t("product.goldValue")} · {product.weight}g × {inr(product.breakup.ratePerGram)}
                  </dt>
                  <dd className="text-charcoal">{inr(product.breakup.metalValue)}</dd>
                </div>
                {product.gemstoneValue > 0 && (
                  <div className="flex justify-between text-stone">
                    <dt>
                      {t("product.gemValue")}
                      {product.gemstoneCarats ? ` · ${product.gemstoneCarats}ct` : ""}
                    </dt>
                    <dd className="text-charcoal">{inr(product.gemstoneValue)}</dd>
                  </div>
                )}
                <div className="flex justify-between text-stone">
                  <dt>{t("product.making")} ({product.makingPct}%)</dt>
                  <dd className="text-charcoal">{inr(product.breakup.makingCharges)}</dd>
                </div>
                <div className="flex justify-between text-stone">
                  <dt>{t("product.gst")}</dt>
                  <dd className="text-charcoal">{inr(product.breakup.gst)}</dd>
                </div>
                <div className="flex justify-between border-t border-copper/15 pt-2.5 text-[13px]">
                  <dt className="uppercase tracking-widest2 text-[10px] text-copper-dark">{t("product.total")}</dt>
                  <dd className="font-serif text-lg text-navy">{inr(product.price)}</dd>
                </div>
              </dl>
              <p className="mt-3 flex items-center gap-1.5 text-[10px] text-stone">
                <ShieldCheck className="h-3 w-3" strokeWidth={1.4} /> Calculated on our server against today’s Hindaun rate.
              </p>
            </details>

            {/* Accordions */}
            <div className="mt-6">
              <Accordion title={t("product.details")} open>
                <p>{product.description}</p>
              </Accordion>
              <Accordion title={t("product.story")}>
                <p className="italic">“{product.story}”</p>
              </Accordion>
              <Accordion title="Specifications">
                <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11.5px]">
                  <li className="flex justify-between border-b border-copper/10 pb-1.5">
                    <span className="text-stone">Metal</span>
                    <span className="text-charcoal">{SPEC_LABELS[product.metal]}</span>
                  </li>
                  <li className="flex justify-between border-b border-copper/10 pb-1.5">
                    <span className="text-stone">Purity</span>
                    <span className="text-charcoal">{product.purity}</span>
                  </li>
                  <li className="flex justify-between border-b border-copper/10 pb-1.5">
                    <span className="text-stone">Weight</span>
                    <span className="text-charcoal">{product.weight} g</span>
                  </li>
                  <li className="flex justify-between border-b border-copper/10 pb-1.5">
                    <span className="text-stone">Gemstone</span>
                    <span className="capitalize text-charcoal">{(product.gemstoneSlug ?? "none").replace("-", " ")}</span>
                  </li>
                  <li className="flex justify-between border-b border-copper/10 pb-1.5">
                    <span className="text-stone">Occasion</span>
                    <span className="capitalize text-charcoal">{product.occasions[0]?.replace("-", " ")}</span>
                  </li>
                  <li className="flex justify-between border-b border-copper/10 pb-1.5">
                    <span className="text-stone">Collection</span>
                    <span className="capitalize text-charcoal">{product.collections[0]}</span>
                  </li>
                </ul>
              </Accordion>
            </div>
          </div>
        </div>
      </div>

      {/* 360 viewer */}
      <AnimatePresence>
        {viewer360 && (
          <motion.div
            className="fixed inset-0 z-[95] flex items-center justify-center bg-navy/95 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button onClick={() => setViewer360(false)} className="absolute right-5 top-5 text-ivory/70 hover:text-ivory" aria-label="Close 360 view">
              <X className="h-6 w-6" />
            </button>
            <div
              className="relative aspect-square w-full max-w-xl cursor-grab overflow-hidden border border-copper/25 active:cursor-grabbing"
              onPointerDown={(e) => {
                dragRef.current = { x: e.clientX, start: frame };
                (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
              }}
              onPointerMove={(e) => {
                if (!dragRef.current) return;
                const delta = e.clientX - dragRef.current.x;
                const next = dragRef.current.start + Math.round(delta / 18);
                setFrame(((next % frames.length) + frames.length) % frames.length);
              }}
              onPointerUp={() => (dragRef.current = null)}
              onPointerLeave={() => (dragRef.current = null)}
            >
              <Image src={frames[frame]} alt={`${product.name} 360 view`} fill sizes="600px" className="object-cover" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 bg-gradient-to-t from-navy/80 to-transparent p-5">
                <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest2 text-ivory/80">
                  <RotateCw className="h-3.5 w-3.5" /> Drag to rotate
                </div>
                <div className="flex gap-1">
                  {frames.map((_, i) => (
                    <span key={i} className={cn("h-1 w-4 transition-colors", i === frame ? "bg-copper" : "bg-ivory/25")} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Book visit */}
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
              className="w-full max-w-md bg-ivory p-6 sm:p-8"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="label mb-2">Store visit</p>
                  <h3 className="font-serif text-2xl text-navy">See it in person</h3>
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
                  <p className="mt-2 font-serif text-xl text-navy">Request received</p>
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
        <section className="mt-20 border-t border-copper/15 pt-14">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="label mb-2">{isHi ? "और भी देखें" : "Complete the look"}</p>
              <h2 className="h2 text-navy">{t("product.similar")}</h2>
            </div>
            <Link href={`/collections/${product.collections[0] ?? "all"}`} className="hidden text-[10px] uppercase tracking-widest2 text-copper-dark sm:block">
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
