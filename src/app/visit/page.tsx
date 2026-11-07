import type { Metadata } from "next";
import { BadgeCheck, Clock, MapPin, Phone, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { PageShell, Breadcrumbs } from "@/components/layout/PageShell";
import { VisitStore } from "@/components/home/VisitStore";
import { SHOP, fullAddress, mapsLink, telLink, waLink } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Visit Our Store — Jagdamba Market, Hindaun",
  description:
    "Visit JMD Gems & Jewellery at Jagdamba Market, Mohan Nagar, Hindaun-322230, Rajasthan. Open 10:30 am – 8:30 pm. Call 7891384376 or 6377419074.",
  alternates: { canonical: "/visit" },
};

const services = [
  { icon: ShieldCheck, title: "Hallmark on the spot", text: "Every gold piece is BIS hallmarked and weighed in front of you." },
  { icon: Sparkles, title: "Free cleaning & polishing", text: "Bring any JMD piece, any year — we clean it while you wait." },
  { icon: BadgeCheck, title: "Certificate in the box", text: "IGI / GIA certificates for every diamond and gemstone we sell." },
  { icon: Truck, title: "Insured doorstep delivery", text: "Across Rajasthan in 2–3 days, rest of India in 3–5." },
];

export default function VisitPage() {
  return (
    <PageShell tight>
      <div className="container-x">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Visit our store" }]} />

        <header className="grid gap-8 border-b border-copper/15 pb-10 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div>
            <p className="label mb-3">Since {SHOP.established} · Hindaun</p>
            <h1 className="font-serif text-4xl leading-tight text-white sm:text-5xl lg:text-6xl">
              A shop you can walk into,
              <br />
              <span className="italic text-copper-dark">and a family you can call.</span>
            </h1>
            <p className="mt-4 max-w-xl text-[13px] leading-relaxed text-stone">
              We are at Jagdamba Market, Mohan Nagar — the same counter, the same weighing scale and the same
              family for three generations. Come in for chai, even if you are only looking.
            </p>
          </div>
          <div className="space-y-2.5 border border-copper/20 bg-white/[0.04] p-5">
            <p className="flex items-start gap-2 text-[12px] text-charcoal/80">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-copper-dark" strokeWidth={1.4} /> {fullAddress}
            </p>
            <p className="flex items-center gap-2 text-[12px] text-charcoal/80">
              <Clock className="h-4 w-4 shrink-0 text-copper-dark" strokeWidth={1.4} /> {SHOP.hours}
            </p>
            {SHOP.phones.map((p) => (
              <a key={p} href={telLink(p)} className="flex items-center gap-2 text-[12px] text-charcoal/80 hover:text-copper-dark">
                <Phone className="h-4 w-4 shrink-0 text-copper-dark" strokeWidth={1.4} /> +91 {p}
              </a>
            ))}
            <div className="flex gap-2 pt-1">
              <a href={mapsLink()} target="_blank" rel="noopener noreferrer" className="btn-copper flex-1 px-3 py-2.5 text-[9.5px]">
                Directions
              </a>
              <a
                href={waLink("Namaste! I would like to visit your store. Please share the location and timings.")}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp flex-1 px-3 py-2.5 text-[9.5px]"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </header>
      </div>

      <div id="certification" className="container-x mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((s) => (
          <div key={s.title} className="border border-copper/15 bg-white/[0.04] p-6">
            <s.icon className="h-6 w-6 text-copper-dark" strokeWidth={1.2} />
            <h3 className="mt-4 font-serif text-lg text-white">{s.title}</h3>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-stone">{s.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <VisitStore />
      </div>

      <div className="container-x mt-4 pb-16">
        <div className="border border-copper/20 bg-lilacsoft p-6 sm:p-10">
          <p className="label mb-3">Coming from out of town?</p>
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <h3 className="font-serif text-xl text-white">By train</h3>
              <p className="mt-1.5 text-[12px] leading-relaxed text-stone">
                Hindaun City railway station is 1.8 km away. Auto to Jagdamba Market takes 8 minutes.
              </p>
            </div>
            <div>
              <h3 className="font-serif text-xl text-white">By bus</h3>
              <p className="mt-1.5 text-[12px] leading-relaxed text-stone">
                Hindaun bus stand is a 5-minute walk. Ask for Mohan Nagar, Jagdamba Market — everyone knows us.
              </p>
            </div>
            <div>
              <h3 className="font-serif text-xl text-white">By car</h3>
              <p className="mt-1.5 text-[12px] leading-relaxed text-stone">
                Two-wheeler and car parking is available in front of the market. Call us and we will guide you in.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
