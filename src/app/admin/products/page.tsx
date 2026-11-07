import Link from "next/link";
import { Plus } from "lucide-react";
import { getProductsForAdmin } from "@/lib/repo";
import { ProductsTable } from "@/components/admin/ProductsTable";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getProductsForAdmin();
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[9px] uppercase tracking-widest2 text-copper-dark">Catalogue</p>
          <h1 className="mt-1 font-serif text-3xl text-white">Products</h1>
          <p className="mt-1 text-[11.5px] text-stone">{products.length} pieces live in the store.</p>
        </div>
        <Link href="/admin/products/new" className="btn-copper px-4 py-2.5 text-[9.5px]">
          <Plus className="h-3.5 w-3.5" /> Add product
        </Link>
      </div>
      <ProductsTable products={products} />
    </div>
  );
}
