import type { Metadata } from "next";
import { WishlistView } from "@/components/account/WishlistView";
import { PageShell, Breadcrumbs } from "@/components/layout/PageShell";

export const metadata: Metadata = {
  title: "Your Wishlist",
  description: "Pieces you have saved from JMD Gems & Jewellery, Hindaun.",
  robots: { index: false, follow: false },
};

export default function WishlistPage() {
  return (
    <PageShell>
      <div className="container-x">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Wishlist" }]} />
        <header className="mb-10">
          <p className="label mb-2">Saved for later</p>
          <h1 className="font-serif text-4xl text-navy sm:text-5xl">Your Wishlist</h1>
        </header>
        <WishlistView />
      </div>
    </PageShell>
  );
}
