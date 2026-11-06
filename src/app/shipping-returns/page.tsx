import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { fullAddress, telLink } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Shipping and returns",
  description:
    "How JMD Gems & Jewellery delivers orders in and around Hindaun, how store pickup works, and what to do if a piece is not right.",
  alternates: { canonical: "/shipping-returns" },
};

/**
 * [CONFIRM WITH SHOP] — courier partners, delivery charges, delivery timelines,
 * the exchange window and whether gold/silver buyback is offered are all
 * unknown. Nothing in this page invents a window or a refund promise.
 */
export default function ShippingReturnsPage() {
  return (
    <PageShell>
      <div className="container-x">
        <div className="measure">
          <p className="label">Shipping and returns</p>
          <h1 className="mt-4 text-28 sm:text-44">Delivery, pickup and what happens after</h1>

          <div className="mt-8 space-y-6 text-16 text-charcoal/80">
            <section>
              <h2 className="text-20">Collect from the shop</h2>
              <p className="mt-2">
                The simplest option: choose &ldquo;pay and collect at the store&rdquo; at checkout. Your piece is
                kept aside at {fullAddress} and you pay at the counter when you collect it.
              </p>
            </section>

            <section>
              <h2 className="text-20">Home delivery</h2>
              <p className="mt-2">
                We arrange delivery for orders placed on the website. Because jewellery is insured, we confirm
                every delivery order on the phone or WhatsApp before dispatch.
              </p>
              <p className="mt-2 border-l-2 border-copper/50 pl-4 text-14 text-stone">
                [CONFIRM WITH SHOP] courier partner, delivery charge, insured-value limit and how many days
                delivery usually takes around Hindaun, Karauli and Jaipur.
              </p>
            </section>

            <section>
              <h2 className="text-20">If a piece is not right</h2>
              <p className="mt-2">
                Tell us within the window the shop agrees to. We will look at the piece with you, check the
                invoice and the certificate, and settle it at the counter.
              </p>
              <p className="mt-2 border-l-2 border-copper/50 pl-4 text-14 text-stone">
                [CONFIRM WITH SHOP] exchange window in days, whether custom or made-to-order pieces can be
                exchanged at all, and any making-charge deduction. This must be written down before the site
                promises it.
              </p>
            </section>

            <section>
              <h2 className="text-20">Gold and silver buyback</h2>
              <p className="mt-2 border-l-2 border-copper/50 pl-4 text-14 text-stone">
                [CONFIRM WITH SHOP] whether buyback is offered, at what rate (market rate minus making charges, or
                otherwise), and what documents are needed. No buyback promise is made on this page until then.
              </p>
            </section>
          </div>

          <div className="mt-9 flex flex-col gap-2 sm:flex-row">
            <Button href={telLink("7891384376")} variant="navy">
              Call 7891384376
            </Button>
            <Button href="/contact" variant="outline">
              Contact and map
            </Button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
