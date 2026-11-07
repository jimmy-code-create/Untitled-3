import { notFound } from "next/navigation";
import { getProduct } from "@/lib/repo";
import { ProductForm } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[9px] uppercase tracking-widest2 text-copper-dark">Editing</p>
        <h1 className="mt-1 font-serif text-3xl text-white">{product.name}</h1>
        <p className="mt-1 text-[11.5px] text-stone">Current selling price ₹{product.price.toLocaleString("en-IN")}</p>
      </div>
      <ProductForm initial={product} />
    </div>
  );
}
