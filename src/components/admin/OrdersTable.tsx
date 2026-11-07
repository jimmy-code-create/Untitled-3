"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import type { DemoOrder } from "@/lib/demo-db";
import { inr } from "@/lib/pricing";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/store/toast";

const STATUSES = ["PENDING", "CONFIRMED", "PACKED", "SHIPPED", "READY_FOR_PICKUP", "DELIVERED", "CANCELLED"];

export function OrdersTable({ orders }: { orders: DemoOrder[] }) {
  const router = useRouter();
  const push = useToast((s) => s.push);
  const [rows, setRows] = useState(orders);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("");

  const update = async (order: DemoOrder, patch: Record<string, string>) => {
    const res = await fetch(`/api/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = await res.json();
    if (!data.ok) {
      push("Update failed", data.error);
      return;
    }
    setRows((prev) => prev.map((o) => (o.id === order.id ? { ...o, ...patch } : o)));
    push("Order updated", order.orderNumber);
    router.refresh();
  };

  const visible = rows.filter((o) => {
    const matchQuery =
      !query ||
      o.orderNumber.toLowerCase().includes(query.toLowerCase()) ||
      o.customerName.toLowerCase().includes(query.toLowerCase()) ||
      o.phone.includes(query);
    return matchQuery && (!filter || o.status === filter);
  });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-1 items-center gap-2 border border-copper/25 bg-white/[0.04] px-3 py-2 sm:max-w-xs">
          <Search className="h-3.5 w-3.5 text-stone" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search order, name or phone"
            className="w-full bg-transparent text-[11.5px] focus:outline-none"
          />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border border-copper/25 bg-white/[0.04] px-3 py-2 text-[11px]">
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <span className="text-[10px] uppercase tracking-widest2 text-stone">{visible.length} orders</span>
      </div>

      <div className="overflow-x-auto border border-copper/20 bg-white/[0.04]">
        <table className="w-full min-w-[860px] text-left">
          <thead>
            <tr className="border-b border-copper/15 text-[9px] uppercase tracking-widest2 text-stone">
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Items</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Payment</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Tracking</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-copper/10">
            {visible.map((o) => (
              <tr key={o.id} className="align-top hover:bg-lilacsoft/30">
                <td className="px-4 py-3">
                  <p className="text-[11.5px] text-white">{o.orderNumber}</p>
                  <p className="text-[9px] text-stone">{formatDate(o.createdAt)}</p>
                  <p className="mt-0.5 text-[8.5px] uppercase tracking-wider text-copper-dark">{o.fulfillment}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-[11px] text-charcoal">{o.customerName}</p>
                  <a href={`tel:+91${o.phone}`} className="text-[9.5px] text-stone hover:text-copper-dark">
                    {o.phone}
                  </a>
                </td>
                <td className="px-4 py-3 text-[10px] text-stone">
                  {o.items.map((i) => (
                    <p key={i.slug} className="truncate">
                      {i.name} × {i.quantity}
                    </p>
                  ))}
                </td>
                <td className="px-4 py-3 text-[11.5px] text-charcoal">{inr(o.total)}</td>
                <td className="px-4 py-3">
                  <span className={o.paymentStatus === "PAID" ? "text-[9.5px] uppercase tracking-wider text-whatsapp" : "text-[9.5px] uppercase tracking-wider text-marigold"}>
                    {o.paymentStatus}
                  </span>
                  <p className="text-[8.5px] text-stone">{o.paymentMethod}</p>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={o.status}
                    onChange={(e) => update(o, { status: e.target.value })}
                    className="border border-copper/25 bg-white/[0.04] px-2 py-1 text-[10px]"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <input
                    defaultValue={o.trackingNo ?? ""}
                    onBlur={(e) => e.target.value !== (o.trackingNo ?? "") && update(o, { trackingNo: e.target.value, courier: o.courier ?? "Delhivery" })}
                    placeholder="AWB number"
                    className="w-[110px] border border-copper/25 px-2 py-1 text-[10px]"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {visible.length === 0 && <p className="px-4 py-10 text-center text-[11.5px] text-stone">No orders match.</p>}
      </div>
    </div>
  );
}
