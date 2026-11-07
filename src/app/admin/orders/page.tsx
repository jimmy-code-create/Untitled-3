import { listOrders } from "@/lib/repo";
import { OrdersTable } from "@/components/admin/OrdersTable";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await listOrders();
  return (
    <div className="space-y-5">
      <div>
        <p className="text-[9px] uppercase tracking-widest2 text-copper-dark">Fulfilment</p>
        <h1 className="mt-1 font-serif text-3xl text-white">Orders</h1>
        <p className="mt-1 text-[11.5px] text-stone">Update status and add tracking numbers — the customer sees it in their account.</p>
      </div>
      <OrdersTable orders={orders} />
    </div>
  );
}
