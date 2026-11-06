"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import type { ProductView } from "@/lib/repo";
import { inr } from "@/lib/pricing";
import { useToast } from "@/store/toast";

export function ProductsTable({ products }: { products: ProductView[] }) {
  const router = useRouter();
  const push = useToast((s) => s.push);
  const [rows, setRows] = useState(products);
  const [busy, setBusy] = useState<string | null>(null);

  const remove = async (slug: string, name: string) => {
    if (!window.confirm(`Delete “${name}”? This cannot be undone.`)) return;
    setBusy(slug);
    const res = await fetch(`/api/products/${slug}`, { method: "DELETE" });
    const data = await res.json();
    setBusy(null);
    if (!data.ok) {
      push("Could not delete", data.error);
      return;
    }
    setRows((r) => r.filter((p) => p.slug !== slug));
    push("Product deleted", name);
    router.refresh();
  };

  return (
    <div className="overflow-x-auto border border-copper/20 bg-white">
      <table className="w-full min-w-[720px] text-left">
        <thead>
          <tr className="border-b border-copper/15 text-[9px] uppercase tracking-widest2 text-stone">
            <th className="px-4 py-3 font-medium">Piece</th>
            <th className="px-4 py-3 font-medium">Metal</th>
            <th className="px-4 py-3 font-medium">Weight</th>
            <th className="px-4 py-3 font-medium">Price</th>
            <th className="px-4 py-3 font-medium">Stock</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-copper/10">
          {rows.map((p) => (
            <tr key={p.slug} className="hover:bg-lilacsoft/30">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-11 w-9 shrink-0 overflow-hidden bg-ivorydim">
                    <Image src={p.images[0]} alt="" fill sizes="36px" className="object-cover" />
                  </div>
                  <div>
                    <p className="text-[11.5px] text-navy">{p.name}</p>
                    <p className="text-[9px] text-stone">{p.slug}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-[10.5px] text-stone">
                {p.purity} {p.metal}
              </td>
              <td className="px-4 py-3 text-[10.5px] text-stone">{p.weight} g</td>
              <td className="px-4 py-3 text-[11.5px] text-charcoal">{inr(p.price)}</td>
              <td className="px-4 py-3">
                <span className={p.stock > 0 ? "text-[10.5px] text-whatsapp" : "text-[10.5px] text-ruby"}>{p.stock}</span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <Link
                    href={`/admin/products/${p.slug}`}
                    className="grid h-8 w-8 place-items-center border border-copper/25 text-copper-dark hover:bg-copper hover:text-white"
                    aria-label={`Edit ${p.name}`}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Link>
                  <button
                    onClick={() => remove(p.slug, p.name)}
                    disabled={busy === p.slug}
                    className="grid h-8 w-8 place-items-center border border-copper/25 text-stone hover:border-ruby/40 hover:text-ruby disabled:opacity-40"
                    aria-label={`Delete ${p.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <p className="px-4 py-10 text-center text-[11.5px] text-stone">No products yet.</p>}
    </div>
  );
}
