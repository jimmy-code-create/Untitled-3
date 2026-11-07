"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Box, Heart, LogOut, MapPin, PackageCheck, Truck } from "lucide-react";
import { WishlistView } from "./WishlistView";
import { inr } from "@/lib/pricing";
import { cn, formatDate, waLink } from "@/lib/utils";
import type { DemoOrder } from "@/lib/demo-db";

const FLOW = ["PENDING", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED"];
const LABELS: Record<string, string> = {
  PENDING: "Placed",
  CONFIRMED: "Confirmed",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  READY_FOR_PICKUP: "Ready for pickup",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

function Timeline({ status, pickup }: { status: string; pickup: boolean }) {
  const steps = pickup ? ["PENDING", "CONFIRMED", "PACKED", "READY_FOR_PICKUP", "DELIVERED"] : FLOW;
  const current = Math.max(0, steps.indexOf(status));
  return (
    <div className="mt-4 flex items-center">
      {steps.map((s, i) => (
        <div key={s} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center">
            <span
              className={cn(
                "grid h-5 w-5 place-items-center rounded-full border text-[8px]",
                i <= current ? "border-copper bg-copper text-white" : "border-copper/30 text-copper/40",
              )}
            >
              {i <= current ? "✓" : i + 1}
            </span>
            <span className={cn("mt-1 w-14 text-center text-[8px] uppercase tracking-wider", i <= current ? "text-copper-dark" : "text-stone")}>
              {LABELS[s]}
            </span>
          </div>
          {i < steps.length - 1 && <span className={cn("mb-4 h-px flex-1", i < current ? "bg-copper" : "bg-copper/20")} />}
        </div>
      ))}
    </div>
  );
}

export function AccountView({
  orders,
  user,
}: {
  orders: DemoOrder[];
  user: { name?: string | null; email?: string | null; phone?: string | null; role?: string };
}) {
  const [tab, setTab] = useState<"orders" | "wishlist" | "addresses">("orders");
  const addresses = Array.from(
    new Map(orders.map((o) => [`${o.address.line1}-${o.address.pincode}`, o.address])).values(),
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
      <aside>
        <div className="border border-copper/20 bg-white/[0.04] p-5">
          <p className="font-serif text-xl text-white">{user.name || "JMD Customer"}</p>
          <p className="mt-0.5 text-[11px] text-stone">{user.phone ? `+91 ${user.phone}` : user.email}</p>
          <div className="mt-4 space-y-1 border-t border-copper/15 pt-4">
            {[
              { id: "orders" as const, label: "Orders & tracking", icon: Box },
              { id: "wishlist" as const, label: "Wishlist", icon: Heart },
              { id: "addresses" as const, label: "Addresses", icon: MapPin },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={cn(
                  "flex w-full items-center gap-2.5 px-2 py-2 text-left text-[11.5px] transition-colors",
                  tab === item.id ? "bg-copper/10 text-copper-dark" : "text-charcoal/70 hover:text-copper-dark",
                )}
              >
                <item.icon className="h-3.5 w-3.5" strokeWidth={1.4} /> {item.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="mt-4 flex w-full items-center gap-2.5 border-t border-copper/15 pt-4 text-[11px] text-stone hover:text-ruby"
          >
            <LogOut className="h-3.5 w-3.5" strokeWidth={1.4} /> Sign out
          </button>
        </div>
        <div className="mt-3 border border-copper/20 bg-lilacsoft/60 p-4 text-[10.5px] leading-relaxed text-stone">
          Need help with an order? WhatsApp us at{" "}
          <a href={waLink("Namaste! I need help with my order.")} className="text-copper-dark underline" target="_blank" rel="noopener noreferrer">
            7891384376
          </a>
          .
        </div>
      </aside>

      <div>
        {tab === "orders" && (
          <>
            <h2 className="mb-5 font-serif text-2xl text-white">Your orders</h2>
            {orders.length === 0 ? (
              <div className="border border-copper/15 bg-white/[0.04] px-6 py-16 text-center">
                <PackageCheck className="mx-auto h-9 w-9 text-copper/40" strokeWidth={1.1} />
                <p className="mt-3 font-serif text-xl text-white">No orders yet</p>
                <p className="mt-1 text-[11.5px] text-stone">Your first JMD piece is waiting.</p>
                <Link href="/collections/all" className="btn-copper mt-5">
                  Browse collections
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <article key={order.id} className="border border-copper/20 bg-white/[0.04]">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-copper/12 bg-lilacsoft/40 px-5 py-3">
                      <div>
                        <p className="text-[9px] uppercase tracking-widest2 text-stone">Order</p>
                        <p className="text-[12px] text-white">{order.orderNumber}</p>
                      </div>
                      <div className="text-[10px] text-stone">{formatDate(order.createdAt)}</div>
                      <div className="flex items-center gap-2">
                        <span className="border border-copper/25 px-2 py-1 text-[8.5px] uppercase tracking-widest2 text-copper-dark">
                          {LABELS[order.status] ?? order.status}
                        </span>
                        <span className={cn("px-2 py-1 text-[8.5px] uppercase tracking-widest2", order.paymentStatus === "PAID" ? "bg-whatsapp/10 text-whatsapp" : "bg-marigold/10 text-marigold")}>
                          {order.paymentStatus}
                        </span>
                      </div>
                    </div>
                    <div className="px-5 py-4">
                      {order.items.map((item) => (
                        <div key={item.slug} className="flex items-center gap-3 py-1.5">
                          <div className="relative h-14 w-12 shrink-0 overflow-hidden bg-ivorydim">
                            <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
                          </div>
                          <div className="flex-1">
                            <Link href={`/products/${item.slug}`} className="font-serif text-[15px] text-white hover:text-copper-dark">
                              {item.name}
                            </Link>
                            <p className="text-[10px] text-stone">
                              {item.size ? `${item.size} · ` : ""}Qty {item.quantity}
                            </p>
                          </div>
                          <p className="text-[11.5px] text-charcoal">{inr(item.unitPrice * item.quantity)}</p>
                        </div>
                      ))}
                      <div className="mt-3 flex flex-wrap items-end justify-between gap-3 border-t border-copper/15 pt-3">
                        <div className="text-[10.5px] text-stone">
                          <p className="flex items-center gap-1.5">
                            {order.fulfillment === "PICKUP" ? <MapPin className="h-3 w-3" /> : <Truck className="h-3 w-3" />}
                            {order.fulfillment === "PICKUP" ? "Store pickup" : `${order.address.city} — ${order.address.pincode}`}
                          </p>
                          {order.trackingNo && <p className="mt-1">Tracking: {order.trackingNo} · {order.courier}</p>}
                        </div>
                        <p className="font-serif text-lg text-white">{inr(order.total)}</p>
                      </div>
                      <Timeline status={order.status} pickup={order.fulfillment === "PICKUP"} />
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}

        {tab === "wishlist" && (
          <>
            <h2 className="mb-5 font-serif text-2xl text-white">Wishlist</h2>
            <WishlistView />
          </>
        )}

        {tab === "addresses" && (
          <>
            <h2 className="mb-5 font-serif text-2xl text-white">Addresses</h2>
            {addresses.length === 0 ? (
              <div className="border border-copper/15 bg-white/[0.04] px-6 py-14 text-center">
                <MapPin className="mx-auto h-8 w-8 text-copper/40" strokeWidth={1.1} />
                <p className="mt-3 text-[12px] text-stone">Addresses you use at checkout will appear here.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {addresses.map((a, i) => (
                  <div key={i} className="border border-copper/20 bg-white/[0.04] p-5">
                    <p className="text-[9px] uppercase tracking-widest2 text-copper-dark">Saved from order</p>
                    <p className="mt-2 text-[12.5px] text-charcoal/80">{a.fullName}</p>
                    <p className="mt-1 text-[11.5px] leading-relaxed text-stone">
                      {a.line1}
                      {a.line2 ? `, ${a.line2}` : ""}
                      <br />
                      {a.city}, {a.state} — {a.pincode}
                    </p>
                    <p className="mt-2 text-[11px] text-stone">+91 {a.phone}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
