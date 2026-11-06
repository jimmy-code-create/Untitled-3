import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { SHOP, fullAddress } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Terms",
  description:
    "Terms for using the JMD Gems & Jewellery website: indicative prices, order confirmation, certificates and jurisdiction.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <PageShell>
      <div className="container-x">
        <div className="measure">
          <p className="label">Terms</p>
          <h1 className="mt-4 text-28 sm:text-44">Terms of use</h1>
          <p className="mt-3 text-12 uppercase tracking-label text-stone">Last updated: 6 November 2026</p>

          <div className="mt-8 space-y-6 text-16 text-charcoal/80">
            <section>
              <h2 className="text-20">Prices are indicative</h2>
              <p className="mt-2">
                Prices on this website are calculated from the metal weight, the stone value and the making
                charge, using the rate last entered by the shop. Metal rates change during the day. The amount on
                your bill, at the rate in force when you are billed, is the price. See the{" "}
                <Link href="/gold-rate-disclaimer" className="underline decoration-copper/40 underline-offset-4">
                  gold rate disclaimer
                </Link>
                .
              </p>
            </section>

            <section>
              <h2 className="text-20">An order is a request, not a confirmed sale</h2>
              <p className="mt-2">
                When you place an order we call or message you to confirm the piece, the size and the final amount.
                If a piece has been sold at the counter in the meantime, we will tell you and offer the closest
                alternative.
              </p>
            </section>

            <section>
              <h2 className="text-20">Certificates and hallmarking</h2>
              <p className="mt-2 border-l-2 border-copper/50 pl-4 text-14 text-stone">
                [CONFIRM WITH SHOP] which laboratories certify the stones, and whether every gold piece is
                hallmarked. The website should only state what the shop can produce papers for.
              </p>
            </section>

            <section>
              <h2 className="text-20">Delivery and returns</h2>
              <p className="mt-2">
                Delivery, pickup, exchanges and buyback are described on the{" "}
                <Link href="/shipping-returns" className="underline decoration-copper/40 underline-offset-4">
                  shipping and returns
                </Link>{" "}
                page, including the parts still to be confirmed by the shop.
              </p>
            </section>

            <section>
              <h2 className="text-20">Who we are</h2>
              <p className="mt-2">
                {SHOP.name}, {fullAddress}. Phone +91 {SHOP.phones[0]} / +91 {SHOP.phones[1]}. These terms are
                governed by Indian law; disputes are subject to the courts at Hindaun, Rajasthan.
              </p>
            </section>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
