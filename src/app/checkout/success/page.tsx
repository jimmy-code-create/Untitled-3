import type { Metadata } from "next";
import Link from "next/link";
import { Check, MapPin, Phone, Store, Truck } from "lucide-react";
import { getOrder } from "@/lib/repo";
import { Confetti } from "@/components/checkout/Confetti";
import { PageShell } from "@/components/layout/PageShell";
import { inr } from "@/lib/pricing";
import { SHOP, fullAddress, waLink } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Order Confirmed",
  robots: { index: false, follow: false },
};

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; mode?: string }>;
}) {
  const sp = await searchParams;
  const order = sp.order ? await getOrder(sp.order) : null;
  const isStore = order?.paymentMethod === "STORE" || sp.mode === "store";

  return (
    <PageShell>
      <Confetti />
      <div className="container-x">
        <div className="mx-auto max-w-2xl">
          <div className="border border-copper/20 bg-white p-8 text-center sm:p-12">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-copper/30 bg-copper/10">
              <Check className="h-8 w-8 text-copper-dark" strokeWidth={1.4} />
            </div>
            <p className="mt-6 font-hindi text-[11px] tracking-[0.2em] text-copper-dark">
              || शुभ हो ||
            </p>
            <h1 className="mt-2 font-serif text-3xl text-navy sm:text-4xl">
              {order ? "Your order is confirmed" : "Thank you"}
            </h1>
            <p className="mx-auto mt-3 max-w-md text-[12.5px] leading-relaxed text-stone">
              {isStore
                ? "Your piece is reserved. We will call you within a few hours to confirm when to collect it from the store."
                : "We will send a confirmation on WhatsApp and email shortly, with the certificate and invoice."}
            </p>

            {order && (
              <>
                <div className="mt-7 border border-copper/20 bg-lilacsoft/50 p-5 text-left">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="label">Order number</p>
                      <p className="mt-1 font-serif text-xl text-navy">{order.orderNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="label">Total</p>
                      <p className="mt-1 font-serif text-xl text-navy">{inr(order.total)}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-4 border-t border-copper/15 pt-3 text-[11px] text-stone">
                    <span className="flex items-center gap-1.5">
                      {order.fulfillment === "PICKUP" ? <Store className="h-3.5 w-3.5 text-copper-dark" /> : <Truck className="h-3.5 w-3.5 text-copper-dark" />}
                      {order.fulfillment === "PICKUP" ? "Store pickup" : "Home delivery"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-whatsapp" />
                      {order.paymentStatus === "PAID" ? "Paid" : "Pay at store"}
                    </span>
                  </div>
                  <ul className="mt-4 space-y-2 border-t border-copper/15 pt-3">
                    {order.items.map((item) => (
                      <li key={item.slug} className="flex justify-between text-[11.5px]">
                        <span className="text-charcoal/80">
                          {item.name} {item.size ? `· ${item.size}` : ""} × {item.quantity}
                        </span>
                        <span className="text-charcoal">{inr(item.unitPrice * item.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                  <a
                    href={waLink(
                      `Namaste! I've just placed order ${order.orderNumber} on your website. Please confirm the delivery details.`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-whatsapp flex-1"
                  >
                    Confirm on WhatsApp
                  </a>
                  <Link href="/account" className="btn-outline flex-1">
                    Track order
                  </Link>
                </div>
              </>
            )}

            {!order && (
              <Link href="/collections/all" className="btn-copper mt-6">
                Continue shopping
              </Link>
            )}

            <div className="mt-8 border-t border-copper/15 pt-5 text-[11px] leading-relaxed text-stone">
              <p className="flex items-center justify-center gap-1.5">
                <MapPin className="h-3 w-3 text-copper-dark" /> {fullAddress}
              </p>
              <p className="mt-1.5 flex items-center justify-center gap-1.5">
                <Phone className="h-3 w-3 text-copper-dark" /> +91 {SHOP.phones[0]} · +91 {SHOP.phones[1]}
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
