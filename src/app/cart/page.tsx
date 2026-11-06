import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";
import { PageShell, Breadcrumbs } from "@/components/layout/PageShell";

export const metadata: Metadata = {
  title: "Your Cart",
  description: "Review the pieces in your JMD Gems & Jewellery cart.",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <PageShell>
      <div className="container-x">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cart" }]} />
        <header className="mb-10">
          <p className="label mb-2">Almost there</p>
          <h1 className="font-serif text-4xl text-navy sm:text-5xl">Your Cart</h1>
        </header>
        <CartView />
      </div>
    </PageShell>
  );
}
