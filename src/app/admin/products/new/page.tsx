import { ProductForm } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default function NewProductPage() {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-[9px] uppercase tracking-widest2 text-copper-dark">Catalogue</p>
        <h1 className="mt-1 font-serif text-3xl text-white">Add a product</h1>
        <p className="mt-1 text-[11.5px] text-stone">Prices are calculated from the live metal rate — never entered by hand.</p>
      </div>
      <ProductForm />
    </div>
  );
}
