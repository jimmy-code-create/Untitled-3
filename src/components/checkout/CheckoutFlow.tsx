"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheck, Check, ChevronLeft, Loader2, MapPin, ShieldCheck, Store, Truck } from "lucide-react";
import { useCart } from "@/store/cart";
import { useToast } from "@/store/toast";
import { inr } from "@/lib/pricing";
import { SHOP, cn, fullAddress } from "@/lib/utils";

type Step = 1 | 2 | 3;

interface AddressForm {
  name: string;
  phone: string;
  email: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
}

const STEPS = [
  { id: 1, label: "Address" },
  { id: 2, label: "Delivery" },
  { id: 3, label: "Payment" },
];

const STATES = [
  "Rajasthan",
  "Delhi",
  "Uttar Pradesh",
  "Madhya Pradesh",
  "Haryana",
  "Gujarat",
  "Maharashtra",
  "Punjab",
  "Other",
];

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function CheckoutFlow() {
  const router = useRouter();
  const { lines, clear, stampSnapshot } = useCart();
  const push = useToast((s) => s.push);
  const [step, setStep] = useState<Step>(1);
  const [fulfillment, setFulfillment] = useState<"DELIVERY" | "PICKUP">("DELIVERY");
  const [payment, setPayment] = useState<"ONLINE" | "STORE">("ONLINE");
  const [placing, setPlacing] = useState(false);
  const [demoModal, setDemoModal] = useState<{ orderId: string; orderNumber: string } | null>(null);
  const [address, setAddress] = useState<AddressForm>({
    name: "",
    phone: "",
    email: "",
    line1: "",
    line2: "",
    city: "Hindaun",
    state: "Rajasthan",
    pincode: "322230",
  });
  const [quote, setQuote] = useState<{
    subtotal: number;
    gst: number;
    total: number;
    lockToken?: string;
    lockedUntil?: number;
    lockMinutes?: number;
    snapshotId?: string;
    staleLabel?: string | null;
  } | null>(null);
  const [now, setNow] = useState(Date.now());
  const cartKey = lines.map((l) => `${l.slug}:${l.quantity}`).join("|");

  useEffect(() => {
    if (!lines.length) return;
    fetch("/api/cart/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: lines.map((l) => ({ slug: l.slug, quantity: l.quantity })) }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (!d.ok) return;
        setQuote({
          subtotal: d.subtotal,
          gst: d.gst,
          total: d.total,
          lockToken: d.lockToken,
          lockedUntil: d.lockedUntil,
          lockMinutes: d.lockMinutes,
          snapshotId: d.snapshotId,
          staleLabel: d.staleLabel,
        });
        if (d.snapshotId) stampSnapshot(d.snapshotId);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartKey]);

  useEffect(() => {
    if (!quote?.lockedUntil) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [quote?.lockedUntil]);

  const lockSeconds = quote?.lockedUntil ? Math.max(0, Math.floor((quote.lockedUntil - now) / 1000)) : 0;
  const lockClock = `${String(Math.floor(lockSeconds / 60)).padStart(2, "0")}:${String(lockSeconds % 60).padStart(2, "0")}`;

  const localTotal = useMemo(
    () => lines.reduce((n, l) => n + l.price * l.quantity, 0),
    [lines],
  );
  const subtotal = quote?.subtotal ?? localTotal;
  const gst = quote?.gst ?? Math.round(localTotal * 0.03);
  const total = quote?.total ?? subtotal + gst;

  const addressValid =
    address.name.trim().length > 1 &&
    /^\d{10}$/.test(address.phone) &&
    /^\S+@\S+\.\S+$/.test(address.email) &&
    address.line1.trim().length > 3 &&
    address.city.trim().length > 1 &&
    /^\d{6}$/.test(address.pincode);

  if (lines.length === 0 && !placing) {
    return (
      <div className="border border-copper/15 bg-white/[0.04] px-6 py-20 text-center">
        <p className="font-serif text-2xl text-white">Your cart is empty</p>
        <Link href="/collections/all" className="btn-copper mt-6">
          Browse collections
        </Link>
      </div>
    );
  }

  const loadRazorpay = () =>
    new Promise<boolean>((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const verifyPayment = async (orderId: string, payload: Record<string, unknown>, orderNumber: string) => {
    const res = await fetch("/api/payments/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, ...payload }),
    });
    const data = await res.json();
    if (!data.ok) {
      push("Payment verification failed", data.error);
      return;
    }
    clear();
    router.push(`/checkout/success?order=${orderNumber}`);
  };

  const placeOrder = async () => {
    setPlacing(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map((l) => ({ slug: l.slug, size: l.size, quantity: l.quantity })),
          customer: { name: address.name, phone: address.phone, email: address.email },
          address: {
            line1: address.line1,
            line2: address.line2,
            city: address.city,
            state: address.state,
            pincode: address.pincode,
          },
          fulfillment,
          paymentMethod: payment,
          lockToken: quote?.lockToken,
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Could not place order");
      if (data.repriced) {
        push("Rate changed", "Your 15-minute price lock had expired, so the order was re-priced at today's rate.");
      }

      const { order } = data;

      if (payment === "STORE") {
        clear();
        router.push(`/checkout/success?order=${order.orderNumber}&mode=store`);
        return;
      }

      const payRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });
      const pay = await payRes.json();
      if (!pay.ok) throw new Error(pay.error ?? "Payment could not be started");

      if (pay.demo) {
        setDemoModal({ orderId: order.id, orderNumber: order.orderNumber });
        return;
      }

      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Could not load the payment gateway. Please try again.");

      const rzp = new window.Razorpay({
        key: pay.keyId,
        amount: pay.amount,
        currency: pay.currency,
        order_id: pay.razorpayOrderId,
        name: SHOP.name,
        description: `Order ${order.orderNumber}`,
        image: "/favicon.svg",
        prefill: { name: address.name, email: address.email, contact: address.phone },
        notes: { orderId: order.id },
        theme: { color: "#C98B6B" },
        handler: (response: any) =>
          verifyPayment(
            order.id,
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            },
            order.orderNumber,
          ),
        modal: { ondismiss: () => push("Payment cancelled", "Your order is saved as pending.") },
      });
      rzp.open();
    } catch (error) {
      push("Something went wrong", (error as Error).message);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[1.35fr_1fr] lg:gap-14">
      <div>
        {/* Stepper */}
        <ol className="mb-8 flex items-center gap-2">
          {STEPS.map((s, i) => (
            <li key={s.id} className="flex flex-1 items-center gap-2">
              <button
                onClick={() => s.id < step && setStep(s.id as Step)}
                className={cn(
                  "flex items-center gap-2 text-[10px] uppercase tracking-widest2",
                  step >= s.id ? "text-copper-dark" : "text-stone",
                )}
              >
                <span
                  className={cn(
                    "grid h-6 w-6 place-items-center rounded-full border text-[10px]",
                    step > s.id ? "border-copper bg-copper text-white" : step === s.id ? "border-copper text-copper-dark" : "border-stone/25",
                  )}
                >
                  {step > s.id ? <Check className="h-3 w-3" /> : s.id}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && <span className={cn("h-px flex-1", step > s.id ? "bg-copper" : "bg-copper/20")} />}
            </li>
          ))}
        </ol>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div className="border border-copper/20 bg-white/[0.04] p-6 sm:p-7">
                <h2 className="font-serif text-2xl text-white">Where should it reach you?</h2>
                <p className="mt-1 text-[11.5px] text-stone">We’ll send the certificate and bill along with the piece.</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <input placeholder="Full name" value={address.name} onChange={(e) => setAddress({ ...address, name: e.target.value })} className="field sm:col-span-2" />
                  <input placeholder="Mobile number" inputMode="numeric" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} className="field" />
                  <input placeholder="Email" type="email" value={address.email} onChange={(e) => setAddress({ ...address, email: e.target.value })} className="field" />
                  <input placeholder="House / street" value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} className="field sm:col-span-2" />
                  <input placeholder="Landmark (optional)" value={address.line2} onChange={(e) => setAddress({ ...address, line2: e.target.value })} className="field sm:col-span-2" />
                  <input placeholder="City" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} className="field" />
                  <select value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} className="field">
                    {STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <input placeholder="Pincode" inputMode="numeric" value={address.pincode} onChange={(e) => setAddress({ ...address, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })} className="field" />
                </div>
                <button onClick={() => setStep(2)} disabled={!addressValid} className="btn-copper mt-6 w-full disabled:cursor-not-allowed disabled:opacity-40">
                  Continue to delivery
                </button>
                {!addressValid && (
                  <p className="mt-2 text-center text-[10px] text-stone">Fill name, 10-digit mobile, email, address and 6-digit pincode.</p>
                )}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div className="border border-copper/20 bg-white/[0.04] p-6 sm:p-7">
                <h2 className="font-serif text-2xl text-white">How would you like it?</h2>
                <div className="mt-5 grid gap-3">
                  <button
                    onClick={() => { setFulfillment("DELIVERY"); setPayment("ONLINE"); }}
                    className={cn("flex items-start gap-4 border p-4 text-left transition-colors", fulfillment === "DELIVERY" ? "border-copper bg-copper/5" : "border-copper/20 hover:border-copper/50")}
                  >
                    <Truck className="mt-0.5 h-5 w-5 shrink-0 text-copper-dark" strokeWidth={1.3} />
                    <span>
                      <span className="flex items-center gap-2 text-[12px] text-white">
                        Home delivery
                        {fulfillment === "DELIVERY" && <BadgeCheck className="h-3.5 w-3.5 text-copper" />}
                      </span>
                      <span className="mt-1 block text-[11px] leading-relaxed text-stone">
                        Insured and tracked. 2–3 days within Rajasthan, 3–5 days across India. Free above ₹25,000.
                      </span>
                    </span>
                  </button>

                  <button
                    onClick={() => { setFulfillment("PICKUP"); setPayment("STORE"); }}
                    className={cn("flex items-start gap-4 border p-4 text-left transition-colors", fulfillment === "PICKUP" ? "border-copper bg-copper/5" : "border-copper/20 hover:border-copper/50")}
                  >
                    <Store className="mt-0.5 h-5 w-5 shrink-0 text-copper-dark" strokeWidth={1.3} />
                    <span>
                      <span className="flex items-center gap-2 text-[12px] text-white">
                        Pick up from store
                        {fulfillment === "PICKUP" && <BadgeCheck className="h-3.5 w-3.5 text-copper" />}
                      </span>
                      <span className="mt-1 block text-[11px] leading-relaxed text-stone">
                        {fullAddress} · {SHOP.hours}
                      </span>
                    </span>
                  </button>
                </div>

                <div className="mt-5 flex items-center gap-3 border-t border-copper/15 pt-4">
                  <MapPin className="h-4 w-4 text-copper-dark" />
                  <p className="text-[11px] text-stone">
                    {address.name}, {address.line1}
                    {address.line2 ? `, ${address.line2}` : ""}, {address.city} — {address.pincode}
                  </p>
                </div>

                <div className="mt-6 flex gap-3">
                  <button onClick={() => setStep(1)} className="btn-outline flex-1">
                    <ChevronLeft className="h-3.5 w-3.5" /> Back
                  </button>
                  <button onClick={() => setStep(3)} className="btn-copper flex-1">
                    Continue to payment
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div className="border border-copper/20 bg-white/[0.04] p-6 sm:p-7">
                <h2 className="font-serif text-2xl text-white">How would you like to pay?</h2>
                <div className="mt-5 grid gap-3">
                  <button
                    onClick={() => setPayment("ONLINE")}
                    className={cn("flex items-start gap-4 border p-4 text-left transition-colors", payment === "ONLINE" ? "border-copper bg-copper/5" : "border-copper/20 hover:border-copper/50")}
                  >
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-copper-dark" strokeWidth={1.3} />
                    <span>
                      <span className="text-[12px] text-white">Pay online — UPI, cards, netbanking</span>
                      <span className="mt-1 block text-[11px] text-stone">Secured by Razorpay. You will receive a GST invoice by email.</span>
                    </span>
                  </button>
                  {fulfillment === "PICKUP" && (
                    <button
                      onClick={() => setPayment("STORE")}
                      className={cn("flex items-start gap-4 border p-4 text-left transition-colors", payment === "STORE" ? "border-copper bg-copper/5" : "border-copper/20 hover:border-copper/50")}
                    >
                      <Store className="mt-0.5 h-5 w-5 shrink-0 text-copper-dark" strokeWidth={1.3} />
                      <span>
                        <span className="text-[12px] text-white">Cash at store pickup</span>
                        <span className="mt-1 block text-[11px] text-stone">Reserve now, pay when you collect. We’ll call to confirm.</span>
                      </span>
                    </button>
                  )}
                </div>

                <div className="mt-5 border border-copper/15 bg-lilacsoft/50 p-4">
                  <p className="label mb-2">Delivering to</p>
                  <p className="text-[11.5px] leading-relaxed text-charcoal/75">
                    {address.name} · +91 {address.phone}
                    <br />
                    {address.line1}
                    {address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state} — {address.pincode}
                    <br />
                    <span className="text-stone">{fulfillment === "PICKUP" ? "Store pickup · " + SHOP.address.line1 : "Home delivery · 3–5 days"}</span>
                  </p>
                </div>

                <div className="mt-6 flex gap-3">
                  <button onClick={() => setStep(2)} className="btn-outline flex-1">
                    <ChevronLeft className="h-3.5 w-3.5" /> Back
                  </button>
                  <button onClick={placeOrder} disabled={placing} className="btn-copper flex-1">
                    {placing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {placing ? "Placing…" : payment === "ONLINE" ? "Pay & place order" : "Place order"}
                  </button>
                </div>
                <p className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-stone">
                  <ShieldCheck className="h-3 w-3" /> Totals are computed on our server. No card details touch this site.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Summary */}
      <aside className="lg:sticky lg:top-6 lg:self-start">
        <div className="border border-copper/20 bg-white/[0.04] p-6">
          <p className="label mb-4">Your order</p>
          <ul className="max-h-[280px] space-y-3 overflow-y-auto pr-1">
            {lines.map((l) => (
              <li key={`${l.slug}-${l.size}`} className="flex gap-3">
                <div className="relative h-16 w-14 shrink-0 overflow-hidden bg-ivorydim">
                  <Image src={l.image} alt={l.name} fill sizes="56px" className="object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-serif text-[15px] leading-tight text-white">{l.name}</p>
                  <p className="text-[10px] text-stone">
                    {l.size ? `${l.size} · ` : ""}Qty {l.quantity}
                  </p>
                </div>
                <p className="text-[12px] text-charcoal">{inr(l.price * l.quantity)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-5 space-y-2 border-t border-copper/15 pt-4 text-[12px]">
            <div className="flex justify-between text-stone">
              <dt>Subtotal</dt>
              <dd className="text-charcoal">{inr(subtotal)}</dd>
            </div>
            <div className="flex justify-between text-stone">
              <dt>GST (3%)</dt>
              <dd className="text-charcoal">{inr(gst)}</dd>
            </div>
            <div className="flex justify-between text-stone">
              <dt>Shipping</dt>
              <dd className="text-whatsapp">{fulfillment === "PICKUP" ? "Store pickup" : "Free · insured"}</dd>
            </div>
            <div className="flex justify-between border-t border-copper/15 pt-3">
              <dt className="text-[10px] uppercase tracking-widest2 text-copper-dark">Total</dt>
              <dd className="font-serif text-2xl text-white">{inr(total)}</dd>
            </div>
          </dl>
          {quote?.lockToken ? (
            <div className={`mt-4 rounded-control border px-4 py-3 text-[10.5px] ${lockSeconds > 0 ? "border-white/10 bg-blush/60 text-burgundy" : "border-gold/40 bg-peach text-gold-dark"}`}>
              {lockSeconds > 0 ? (
                <>Price locked for {quote.lockMinutes ?? 15} minutes · <span className="font-semibold tabular-nums">{lockClock}</span> left</>
              ) : (
                <>The price lock has expired. The order will be re-priced at the current rate.</>
              )}
            </div>
          ) : null}
          {quote?.staleLabel ? (
            <p className="mt-2 text-[10px] text-gold-dark">{quote.staleLabel} — final price is as per billing at the shop.</p>
          ) : null}
          <p className="mt-4 text-[10px] leading-relaxed text-stone">
            Need help? Call {SHOP.phones[0]} or {SHOP.phones[1]} — we’ll complete the order on WhatsApp if you prefer.
          </p>
        </div>
      </aside>

      {/* Demo payment */}
      <AnimatePresence>
        {demoModal && (
          <motion.div
            className="fixed inset-0 z-[95] flex items-center justify-center bg-navy/60 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="w-full max-w-sm border border-copper/20 bg-black p-7 text-center">
              <ShieldCheck className="mx-auto h-9 w-9 text-copper-dark" strokeWidth={1.2} />
              <h3 className="mt-3 font-serif text-2xl text-white">Demo payment</h3>
              <p className="mt-2 text-[11.5px] leading-relaxed text-stone">
                Razorpay keys are not configured, so no real payment will be taken. Your order{" "}
                <span className="text-charcoal">{demoModal.orderNumber}</span> will be marked paid for this demo.
              </p>
              <div className="mt-4 border border-copper/20 bg-white/[0.04] p-3 text-left text-[11px]">
                <div className="flex justify-between"><span className="text-stone">Amount</span><span>{inr(total)}</span></div>
                <div className="mt-1 flex justify-between"><span className="text-stone">Method</span><span>UPI (simulated)</span></div>
              </div>
              <button
                onClick={() => verifyPayment(demoModal.orderId, { demo: true }, demoModal.orderNumber)}
                className="btn-copper mt-5 w-full"
              >
                Complete demo payment
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
