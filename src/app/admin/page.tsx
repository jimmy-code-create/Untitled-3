import Link from "next/link";
import { ArrowUpRight, Box, IndianRupee, MessageSquare, ShoppingBag } from "lucide-react";
import { getStats, listOrders, getProductsForAdmin } from "@/lib/repo";
import { SalesChart } from "@/components/admin/SalesChart";
import { compactInr, inr } from "@/lib/pricing";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [stats, orders, products] = await Promise.all([getStats(), listOrders(), getProductsForAdmin()]);

  const cards = [
    { label: "Revenue (paid)", value: compactInr(stats.revenue), sub: `${stats.orderCount} orders`, icon: IndianRupee },
    { label: "Pending orders", value: String(stats.pendingCount), sub: "Need confirmation", icon: ShoppingBag },
    { label: "Live products", value: String(products.length), sub: "In the catalogue", icon: Box },
    { label: "New enquiries", value: String(stats.enquiryCount), sub: "WhatsApp & visits", icon: MessageSquare },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[9px] uppercase tracking-widest2 text-copper-dark">Dashboard</p>
          <h1 className="mt-1 font-serif text-3xl text-white">Namaste, JMD family</h1>
          <p className="mt-1 text-[11.5px] text-stone">Here is how the shop is doing right now.</p>
        </div>
        <Link href="/admin/products/new" className="btn-copper px-4 py-2.5 text-[9.5px]">
          Add a product
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="border border-copper/20 bg-white/[0.04] p-5">
            <div className="flex items-start justify-between">
              <p className="text-[9px] uppercase tracking-widest2 text-stone">{c.label}</p>
              <c.icon className="h-4 w-4 text-copper-dark" strokeWidth={1.3} />
            </div>
            <p className="mt-3 font-serif text-3xl text-white">{c.value}</p>
            <p className="mt-0.5 text-[10px] text-stone">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="border border-copper/20 bg-white/[0.04] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-xl text-white">Sales</h2>
            <span className="text-[9px] uppercase tracking-widest2 text-stone">Last 14 days</span>
          </div>
          <SalesChart days={stats.days} />
        </div>

        <div className="border border-copper/20 bg-white/[0.04] p-5">
          <h2 className="mb-4 font-serif text-xl text-white">Top pieces</h2>
          <ul className="space-y-3">
            {stats.top.map((t, i) => (
              <li key={t.label} className="flex items-center gap-3">
                <span className="grid h-6 w-6 place-items-center border border-copper/25 text-[9px] text-copper-dark">
                  {i + 1}
                </span>
                <span className="flex-1 truncate text-[11.5px] text-charcoal/80">{t.label}</span>
                <span className="text-[10px] text-stone">{t.value} sold</span>
              </li>
            ))}
            {stats.top.length === 0 && <li className="text-[11px] text-stone">No sales recorded yet.</li>}
          </ul>
          <div className="mt-5 border-t border-copper/15 pt-4">
            <p className="mb-2 text-[9px] uppercase tracking-widest2 text-stone">Revenue by metal</p>
            {stats.byCategory.map((c) => (
              <div key={c.label} className="mb-2">
                <div className="flex justify-between text-[10px] text-stone">
                  <span>{c.label}</span>
                  <span>{compactInr(c.value)}</span>
                </div>
                <div className="mt-1 h-1 w-full bg-copper/10">
                  <div
                    className="h-full bg-copper"
                    style={{ width: `${Math.min(100, (c.value / Math.max(1, stats.revenue)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border border-copper/20 bg-white/[0.04]">
        <div className="flex items-center justify-between border-b border-copper/15 px-5 py-4">
          <h2 className="font-serif text-xl text-white">Recent orders</h2>
          <Link href="/admin/orders" className="flex items-center gap-1 text-[9.5px] uppercase tracking-widest2 text-copper-dark">
            View all <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="divide-y divide-copper/10">
          {orders.slice(0, 6).map((o) => (
            <div key={o.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
              <div className="min-w-[140px]">
                <p className="text-[11.5px] text-white">{o.orderNumber}</p>
                <p className="text-[9.5px] text-stone">{o.customerName || o.email}</p>
              </div>
              <span className="text-[9px] uppercase tracking-widest2 text-copper-dark">{o.status}</span>
              <span className="text-[9.5px] text-stone">{formatDate(o.createdAt)}</span>
              <span className="text-[11.5px] text-charcoal">{inr(o.total)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
