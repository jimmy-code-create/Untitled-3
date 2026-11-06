"use client";

import Image from "next/image";
import { MapPin } from "lucide-react";
import { useLang } from "@/components/providers/LangProvider";
import { Button } from "@/components/ui/Button";
import { SHOP, fullAddress, waLink } from "@/lib/utils";

/**
 * Hero: left-aligned text sitting on the photo plane, cropped tight.
 * No sparkles, no parallax, no slow zoom — the only motion on load is the
 * logo shine in the navbar.
 *
 * [CONFIRM WITH SHOP] "IGI / BIS-certified" is a claim we were told, not proof.
 * Keep it only if the shop can show the certificates.
 */
export function Hero() {
  const { isHi } = useLang();

  return (
    <section className="relative bg-navy">
      <div className="grid lg:grid-cols-[46%_54%]">
        <div className="order-2 flex flex-col justify-center px-5 py-14 sm:px-8 lg:order-1 lg:px-12 lg:py-24">
          <p className="label-light flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
            Jagdamba Market · Mohan Nagar, Hindaun
          </p>

          <h1 className="h1-hero mt-5 text-ivory">
            {isHi ? (
              <>
                सोना, हीरा और रत्न —
                <br />
                <span className="italic text-ivory">तौल और दाम</span> आपके सामने
              </>
            ) : (
              <>
                Gold, diamonds and stones —
                <br />
                <span className="italic text-ivory">weighed and priced</span> in front of you
              </>
            )}
          </h1>

          <p className="measure mt-6 font-hindi text-14 text-ivory/85 sm:text-16">
            हॉलमार्क सोना, प्रमाणित हीरा और चाँदी। दुकान पर आइए — तराज़ू और रेट आपके सामने।
          </p>
          <p className="measure mt-3 text-14 text-ivory/75">
            22K and 18K gold, diamonds and 92.5 silver at our counter in Jagdamba Market. Ask for any piece and
            we will show you the weight and the day&apos;s rate before you decide.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/collections/all" variant="copper">
              See the collection
            </Button>
            <Button
              href={waLink("Namaste JMD Gems & Jewellery. I saw your website and would like to see some pieces.")}
              variant="whatsapp"
              external
            >
              WhatsApp us
            </Button>
          </div>

          <address className="mt-8 border-t border-ivory/15 pt-4 text-12 not-italic text-ivory/75">
            {fullAddress} · +91 {SHOP.phones[0]} / +91 {SHOP.phones[1]}
          </address>
        </div>

        <div className="relative order-1 aspect-[16/10] w-full sm:aspect-[16/10] lg:order-2 lg:aspect-auto lg:min-h-[560px]">
          <Image
            src="/images/hero-necklace.webp"
            alt="Layered gold necklace worn on the neck, photographed at the counter"
            width={1600}
            height={1000}
            priority
            sizes="(max-width: 1024px) 100vw, 54vw"
            className="h-full w-full object-cover object-center"
          />
        </div>
      </div>
    </section>
  );
}
