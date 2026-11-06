import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { SHOP, fullAddress, mapsEmbed, mapsLink, telLink, waLink } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact and map",
  description:
    "Call JMD Gems & Jewellery on 7891384376 or 6377419074, or visit us at Jagdamba Market, Mohan Nagar, Hindaun 322230.",
  alternates: { canonical: "/contact" },
};

/** [CONFIRM WITH SHOP] opening hours, and whether the shop is closed on any weekday. */
export default function ContactPage() {
  return (
    <PageShell>
      <div className="container-x">
        <p className="label">Contact</p>
        <h1 className="mt-4 max-w-[20ch] text-28 sm:text-44 lg:text-72">Come to the counter, or call first</h1>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:gap-16">
          <div>
            <h2 className="text-20">JMD Gems &amp; Jewellery</h2>
            <address className="mt-3 text-16 not-italic leading-relaxed text-charcoal/80">{fullAddress}</address>

            <div className="mt-6 border-t border-navy/15 pt-5">
              <p className="label">Phone and WhatsApp</p>
              {SHOP.phones.map((p) => (
                <a
                  key={p}
                  href={telLink(p)}
                  className="mt-2 flex min-h-11 items-center text-16 text-navy hover:text-copper-dark"
                >
                  +91 {p}
                </a>
              ))}
            </div>

            <div className="mt-6 border-t border-navy/15 pt-5">
              <p className="label">Hours</p>
              <p className="mt-2 text-16 text-charcoal/80">[CONFIRM WITH SHOP] — not confirmed</p>
              <p className="mt-1 text-12 text-stone">
                Please call before travelling on a festival or holiday.
              </p>
            </div>

            <div className="mt-7 flex flex-col gap-2 sm:flex-row">
              <Button href={waLink("Namaste JMD Gems & Jewellery. I would like to visit the shop.")} variant="whatsapp" external>
                WhatsApp us
              </Button>
              <Button href={mapsLink()} variant="outline" external>
                Open in Google Maps
              </Button>
            </div>
          </div>

          <div className="min-h-[320px] border border-navy/15 sm:min-h-[420px]">
            <iframe
              title="Map showing JMD Gems & Jewellery, Jagdamba Market, Hindaun"
              src={mapsEmbed()}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full min-h-[320px] w-full sm:min-h-[420px]"
              style={{ border: 0 }}
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </PageShell>
  );
}
