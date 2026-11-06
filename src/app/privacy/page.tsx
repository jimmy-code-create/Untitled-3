import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { fullAddress, telLink } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What JMD Gems & Jewellery stores when you order, what it does not store, and how to ask for your details to be removed.",
  alternates: { canonical: "/privacy" },
};

/**
 * [CONFIRM WITH SHOP] who is responsible for the records, how long order
 * records are kept (tax rules usually require several years) and whether the
 * shop wants a separate email address for privacy requests.
 */
export default function PrivacyPage() {
  return (
    <PageShell>
      <div className="container-x">
        <div className="measure">
          <p className="label">Privacy</p>
          <h1 className="mt-4 text-28 sm:text-44">What we keep, and why</h1>
          <p className="mt-3 text-12 uppercase tracking-label text-stone">Last updated: 6 November 2026</p>

          <div className="mt-8 space-y-6 text-16 text-charcoal/80">
            <section>
              <h2 className="text-20">When you place an order</h2>
              <p className="mt-2">
                We store your name, phone number, email address, delivery address and the items you ordered. This
                is what we need to prepare the piece, call you about it, and keep an invoice.
              </p>
            </section>

            <section>
              <h2 className="text-20">When you sign in</h2>
              <p className="mt-2">
                Signing in with a phone number creates an account so you can see your orders. We store the account
                and a session cookie. If you sign in with Google, Google tells us your name and email address and
                nothing else.
              </p>
            </section>

            <section>
              <h2 className="text-20">When you use WhatsApp</h2>
              <p className="mt-2">
                The WhatsApp buttons open WhatsApp with a message already written. The message is sent through
                WhatsApp, under WhatsApp&apos;s own privacy terms, not through this website.
              </p>
            </section>

            <section>
              <h2 className="text-20">What we do not do</h2>
              <ul className="mt-2 space-y-2">
                <li>We do not sell or rent your details to anyone.</li>
                <li>We do not run advertising trackers on this site.</li>
                <li>We do not ask for card numbers; payments happen at the counter or through the payment provider.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-20">Asking us to remove your details</h2>
              <p className="mt-2">
                Call {telLink("7891384376").replace("tel:", "+91 ")} or come to the shop at {fullAddress}. We will
                remove your account details. Order records that we are required to keep for tax and warranty
                reasons stay in our books, but we will stop using them to contact you.
              </p>
              <p className="mt-2 border-l-2 border-copper/50 pl-4 text-14 text-stone">
                [CONFIRM WITH SHOP] how long order records are kept, and the name of the person who handles these
                requests.
              </p>
            </section>
          </div>

          <Button href="/contact" variant="outline" className="mt-8">
            Contact the shop
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
