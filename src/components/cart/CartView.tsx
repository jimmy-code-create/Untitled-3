"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { cartSubtotal, useCart } from "@/store/cart";
import { useToast } from "@/store/toast";
import { inr } from "@/lib/pricing";
import { useLang } from "@/components/providers/LangProvider";
import { SHOP, waLink } from "@/lib/utils";

export function CartView() {
  const { lines, setQty, remove, clear } = useCart();
  const push = useToast((s) => s.push);
  const { t, isHi } = useLang();
  const [quote, setQuote] = useState<{ subtotal: number; gst: number; total: number; shipping: number } | null>(null);

  useEffect(() => {
    if (!lines.length) {
      setQuote(null);
      return;
    }
    let active = true;
    fetch("/api/cart/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: lines.map((l) => ({ slug: l.slug, quantity: l.quantity })) }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (active && data.ok) setQuote(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [lines]);

  if (lines.length === 0) {
    return (
      <div className="border border-copper/15 bg-white/[0.04] px-6 py-20 text-center">
        <p className="font-serif text-3xl text-white">{t("cart.empty")}</p>
        <p className="mx-auto mt-3 max-w-sm text-[12.5px] text-stone">
          {isHi ? "नीचे दिए कलेक्शन से शुरुआत करें — या सीधे व्हाट्सएप पर पूछें।" : "Start with a collection below — or simply ask us on WhatsApp."}
        </p>
        <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
          <Link href="/collections/all" className="btn-copper">
            {t("cart.continue")}
          </Link>
          <a href={waLink("Namaste! I'd like help choosing a piece.")} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
            WhatsApp us
          </a>
        </div>
      </div>
    );
  }

  const localSubtotal = cartSubtotal(lines);
  const subtotal = quote?.subtotal ?? localSubtotal;
  const gst = quote?.gst ?? Math.round(localSubtotal * 0.03);
  const total = quote?.total ?? subtotal + gst;

  const waMessage = `Namaste JMD Gems & Jewellery 🙏\n\nI would like to order:\n${lines
    .map((l) => `• ${l.name}${l.size ? ` (${l.size})` : ""} × ${l.quantity} — ${inr(l.price * l.quantity)}`)
    .join("\n")}\n\nSubtotal: ${inr(subtotal)}\nGST: ${inr(gst)}\nTotal: ${inr(total)}\n\nPlease confirm availability.`;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:gap-14">
      <div>
        <div className="flex items-center justify-between border-b border-copper/15 pb-4">
          <p className="text-[11px] uppercase tracking-widest2 text-stone">
            {lines.length} {isHi ? "आइटम" : lines.length === 1 ? "item" : "items"}
          </p>
          <button onClick={clear} className="text-[10px] uppercase tracking-widest2 text-copper-dark underline underline-offset-4">
            {isHi ? "कार्ट खाली करें" : "Clear cart"}
          </button>
        </div>

        <ul className="divide-y divide-copper/12">
          {lines.map((line) => (
            <li key={`${line.slug}-${line.size}`} className="flex gap-4 py-5">
              <Link href={`/products/${line.slug}`} className="relative h-[124px] w-[100px] shrink-0 overflow-hidden bg-ivorydim">
                <Image src={line.image} alt={line.name} fill sizes="100px" className="object-cover" />
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[9px] uppercase tracking-widest2 text-copper-dark/80">
                      {line.purity} {line.metal === "SILVER" ? "Silver" : line.metal.toLowerCase()}
                    </p>
                    <h3 className="mt-1 font-serif text-lg leading-tight text-white">
                      <Link href={`/products/${line.slug}`}>{line.name}</Link>
                    </h3>
                    {line.size && <p className="mt-0.5 text-[11px] text-stone">Size: {line.size}</p>}
                  </div>
                  <button
                    onClick={() => {
                      remove(line.slug, line.size);
                      push("Removed from cart", line.name);
                    }}
                    aria-label="Remove item"
                    className="text-stone transition-colors hover:text-ruby"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.4} />
                  </button>
                </div>

                <div className="mt-auto flex items-end justify-between pt-3">
                  <div className="flex items-center border border-copper/25">
                    <button
                      onClick={() => setQty(line.slug, line.size, line.quantity - 1)}
                      className="grid h-8 w-8 place-items-center text-stone hover:text-copper-dark"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center text-[12px]">{line.quantity}</span>
                    <button
                      onClick={() => setQty(line.slug, line.size, line.quantity + 1)}
                      className="grid h-8 w-8 place-items-center text-stone hover:text-copper-dark"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="font-serif text-lg text-white">{inr(line.price * line.quantity)}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <Link href="/collections/all" className="mt-6 inline-block text-[10px] uppercase tracking-widest2 text-copper-dark underline decoration-copper/40 underline-offset-4">
          ← {t("cart.continue")}
        </Link>
      </div>

      <aside className="lg:sticky lg:top-6 lg:self-start">
        <div className="border border-copper/20 bg-white/[0.04] p-6">
          <p className="label mb-4">Order summary</p>
          <dl className="space-y-2.5 text-[12.5px]">
            <div className="flex justify-between text-stone">
              <dt>{t("cart.subtotal")}</dt>
              <dd className="text-charcoal">{inr(subtotal)}</dd>
            </div>
            <div className="flex justify-between text-stone">
              <dt>GST (3%)</dt>
              <dd className="text-charcoal">{inr(gst)}</dd>
            </div>
            <div className="flex justify-between text-stone">
              <dt>Shipping</dt>
              <dd className="text-whatsapp">{subtotal >= 25000 ? "Free · insured" : "Free"}</dd>
            </div>
            <div className="flex justify-between border-t border-copper/15 pt-3">
              <dt className="text-[10px] uppercase tracking-widest2 text-copper-dark">Total payable</dt>
              <dd className="font-serif text-2xl text-white">{inr(total)}</dd>
            </div>
          </dl>

          <Link href="/checkout" className="btn-copper mt-5 w-full">
            {t("cart.checkout")}
          </Link>
          <a href={waLink(waMessage)} target="_blank" rel="noopener noreferrer" className="btn-whatsapp mt-2.5 w-full">
            Order on WhatsApp
          </a>

          <div className="mt-5 space-y-2 border-t border-copper/15 pt-4 text-[10.5px] text-stone">
            <p className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-copper-dark" strokeWidth={1.4} /> BIS hallmark certificate with every gold piece
            </p>
            <p className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-copper-dark" strokeWidth={1.4} /> Free resizing & lifetime cleaning
            </p>
          </div>
          <p className="mt-4 text-center text-[10px] leading-relaxed text-stone">
            Prices recalculated on our server at today’s rate. Call {SHOP.phones[0]} for any help.
          </p>
        </div>
      </aside>
    </div>
  );
}
