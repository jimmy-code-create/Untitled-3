import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { SHOP, fullAddress, mapsLink, telLink } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About the shop",
  description:
    "JMD Gems & Jewellery at Jagdamba Market, Mohan Nagar, Hindaun — who runs the counter, how pieces are priced and what to ask for when you visit.",
  alternates: { canonical: "/about" },
};

/**
 * [CONFIRM WITH SHOP] — the owner's name, the year the shop opened, how many
 * people work at the counter and the family history are NOT known. The
 * paragraphs below deliberately stop short of inventing them.
 */
export default function AboutPage() {
  return (
    <PageShell>
      <div className="container-x">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] lg:gap-16">
          <div>
            <p className="label">About</p>
            <h1 className="mt-4 text-28 sm:text-44 lg:text-72">
              One counter, two numbers,
              <br />
              no pressure to buy
            </h1>

            <div className="measure mt-8 space-y-5 text-16 text-charcoal/80">
              <p>
                JMD Gems &amp; Jewellery is a family jewellery shop at Jagdamba Market, Mohan Nagar, Hindaun
                (Rajasthan 322230). We sell gold, diamond, gemstone and silver jewellery, and we make bridal sets
                to order.
              </p>
              <p>
                Everything is sold the way it is bought: the piece is weighed on the counter scale, the day&apos;s
                metal rate is told to you, and the making charge is stated before you commit. If a stone is set in
                the piece, its weight and value are shown separately.
              </p>
              <p className="border-l-2 border-copper/50 pl-4 text-14 text-stone">
                [CONFIRM WITH SHOP] Add two or three lines in the owner&apos;s own words — the year the shop
                opened, who customers should ask for at the counter, and what the family specialises in. This is
                the paragraph customers actually read.
              </p>
            </div>

            <div className="mt-10 border-t border-navy/15 pt-8">
              <h2 className="text-20">What you can check yourself</h2>
              <ul className="mt-4 space-y-3 text-14 text-charcoal/80">
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-copper" aria-hidden />
                  The weight of the piece, on the scale, before billing.
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-copper" aria-hidden />
                  The metal rate used for that day, written on the bill.
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-copper" aria-hidden />
                  The making charge, as a percentage or a flat amount.
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-copper" aria-hidden />
                  Certification papers for any stone sold as certified. [CONFIRM WITH SHOP] which labs are used.
                </li>
              </ul>
            </div>
          </div>

          <aside className="border border-navy/15 p-6">
            <p className="label">Find us</p>
            <address className="mt-3 text-14 not-italic leading-relaxed text-charcoal/80">{fullAddress}</address>
            <p className="mt-4 text-14 text-charcoal/80">
              {SHOP.phones.map((p) => (
                <a key={p} href={telLink(p)} className="block min-h-11 leading-[44px] hover:text-copper-dark">
                  +91 {p}
                </a>
              ))}
            </p>
            <p className="mt-2 text-12 uppercase tracking-label text-stone">
              Hours: [CONFIRM WITH SHOP]
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <Button href={mapsLink()} variant="copper" external>
                Get directions
              </Button>
              <Button href="/contact" variant="outline">
                Contact and map
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </PageShell>
  );
}
