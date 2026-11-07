import type { Metadata } from "next";
import { CheckoutFlow } from "@/components/checkout/CheckoutFlow";
import { PageShell, Breadcrumbs } from "@/components/layout/PageShell";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Secure checkout at JMD Gems & Jewellery, Hindaun.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <PageShell>
      <div className="container-x">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cart", href: "/cart" }, { label: "Checkout" }]} />
        <header className="mb-8">
          <p className="label mb-2">Secure checkout</p>
          <h1 className="font-serif text-4xl text-white sm:text-5xl">Checkout</h1>
        </header>
        <CheckoutFlow />
      </div>
    </PageShell>
  );
}
