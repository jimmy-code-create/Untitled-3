"use client";

import Image from "next/image";
import { Clock, MapPin, Navigation, Phone } from "lucide-react";
import { useLang } from "@/components/providers/LangProvider";
import { SHOP, fullAddress, mapsEmbed, mapsLink, telLink, waLink } from "@/lib/utils";
import { Reveal, SectionHeading } from "@/components/ui/Reveal";

export function VisitStore() {
  const { t, isHi } = useLang();

  return (
    <section id="visit" className="bg-black py-16 sm:py-24">
      <div className="container-x">
        <SectionHeading
          kicker={isHi ? "जगदम्बा मार्केट, मोहन नगर" : "Jagdamba Market · Mohan Nagar"}
          title={t("home.visit")}
          sub={
            isHi
              ? "चाय पीने आइए, दस मिनट बैठिए — पूरा कलेक्शन बिना जल्दबाज़ी दिखाएंगे।"
              : "Come for chai, sit for ten minutes and see the full collection without any hurry."
          }
        />
        <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
          <Reveal>
            <div className="flex h-full flex-col justify-between border border-copper/20 bg-white/[0.04] p-6 sm:p-8">
              <div>
                <div className="relative mb-6 aspect-[16/10] overflow-hidden">
                  <Image
                    src="/images/bridal-hands.webp"
                    alt="Inside JMD Gems & Jewellery, Hindaun"
                    width={1200}
                    height={750}
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute bottom-3 left-3 bg-white/[0.04] px-2.5 py-1 text-[8.5px] uppercase tracking-widest2 text-white">
                    Our counter · Hindaun
                  </span>
                </div>

                <p className="label mb-3">{SHOP.name}</p>
                <address className="not-italic">
                  <p className="flex items-start gap-2.5 text-sm leading-relaxed text-charcoal/80">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-copper-dark" strokeWidth={1.4} />
                    {fullAddress}
                  </p>
                  <p className="mt-3 flex items-start gap-2.5 text-sm text-charcoal/80">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-copper-dark" strokeWidth={1.4} />
                    {SHOP.hours}
                  </p>
                  <div className="mt-3 flex flex-col gap-2">
                    {SHOP.phones.map((phone) => (
                      <a
                        key={phone}
                        href={telLink(phone)}
                        className="flex items-center gap-2.5 text-sm text-charcoal/80 hover:text-copper-dark"
                      >
                        <Phone className="h-4 w-4 shrink-0 text-copper-dark" strokeWidth={1.4} />
                        +91 {phone}
                      </a>
                    ))}
                  </div>
                </address>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <a href={mapsLink()} target="_blank" rel="noopener noreferrer" className="btn-copper">
                  <Navigation className="h-3.5 w-3.5" strokeWidth={1.5} /> {t("visit.directions")}
                </a>
                <a href={waLink("Namaste! I would like to visit your store. What are your timings today?")} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
                  WhatsApp
                </a>
              </div>
              <a href={telLink(SHOP.phones[1])} className="btn-outline mt-3 w-full">
                <Phone className="h-3.5 w-3.5" strokeWidth={1.5} /> {t("visit.call")} 6377419074
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="relative h-full min-h-[380px] overflow-hidden border border-copper/20 bg-lilac">
              <iframe
                title="JMD Gems & Jewellery location map"
                src={mapsEmbed()}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full min-h-[380px] w-full grayscale-[0.25]"
                style={{ border: 0 }}
                allowFullScreen
              />
              <div className="pointer-events-none absolute left-4 top-4 max-w-[230px] border border-ivory/20 bg-navy p-4 text-ivory">
                <p className="font-script text-xl text-copper-light">JMD</p>
                <p className="mt-1 text-[10px] uppercase tracking-widest2 text-ivory/70">Gems &amp; Jewellery</p>
                <p className="mt-2 text-[11px] leading-relaxed text-ivory/60">
                  Jagdamba Market, Mohan Nagar, Hindaun — 322230
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
