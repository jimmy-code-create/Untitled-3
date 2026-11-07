import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import {
  IconChat,
  IconFacebook,
  IconInstagram,
  IconMail,
  IconPhone,
  IconWhatsApp,
  IconYouTube,
} from "@/components/icons/JmdIcons";
import { SHOP, telLink, waLink } from "@/lib/utils";
import type { ShopSettings } from "@/lib/settings";

const useful = [
  { label: "Delivery information", href: "/shipping-returns" },
  { label: "Payment options", href: "/terms#payments" },
  { label: "Track your order", href: "/account" },
  { label: "Returns", href: "/shipping-returns#returns" },
  { label: "Find the shop", href: "/visit" },
];

const information = [
  { label: "Blog", href: "/about" },
  { label: "Offers", href: "/collections/all" },
  { label: "Help and FAQs", href: "/contact" },
  { label: "About JMD", href: "/about" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

function PaymentBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-6 items-center rounded-[4px] border border-cream/25 bg-cream/5 px-2 text-[9px] font-semibold uppercase tracking-[0.08em] text-cream/80">
      {children}
    </span>
  );
}

export function Footer({ settings }: { settings: ShopSettings }) {
  const socials = [
    { key: "instagram", href: settings.socials.instagram, Icon: IconInstagram, label: "Instagram" },
    { key: "facebook", href: settings.socials.facebook, Icon: IconFacebook, label: "Facebook" },
    { key: "youtube", href: settings.socials.youtube, Icon: IconYouTube, label: "YouTube" },
  ].filter((s) => s.href);

  return (
    <footer className="bg-black px-4 pb-8 pt-14 sm:px-6">
      <div className="mx-auto max-w-content">
        <div className="rounded-card border border-white/10 bg-white/[0.03] px-5 pb-6 pt-8 text-cream sm:px-8 sm:pt-10">
          <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-[1.15fr_1fr_1fr_1.1fr]">
            <div>
              <Logo variant="light" size="md" />
              <p className="mt-4 max-w-[24ch] text-[12px] leading-relaxed text-cream/75">
                Jagdamba Market, Mohan Nagar, Hindaun-322230, Rajasthan
              </p>
              <p className="mt-2 font-hindi text-[12px] text-gold-light/80">हिंडौन, राजस्थान</p>

              <div className="mt-5">
                <p className="font-serif text-[16px] font-semibold text-cream">Contact Us</p>
                <a
                  href={telLink(SHOP.phones[0])}
                  className="mt-1 inline-flex min-h-11 items-center gap-2 text-[13px] text-cream/85 hover:text-gold-light"
                >
                  <IconPhone size={15} /> 78913 84376
                </a>
              </div>
              <div className="mt-2">
                <p className="font-serif text-[16px] font-semibold text-cream">Chat With Us</p>
                <a
                  href={waLink("Namaste JMD Gems & Jewellery. I would like to chat.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex min-h-11 items-center gap-2 text-[13px] text-cream/85 hover:text-gold-light"
                >
                  <IconWhatsApp size={15} /> 63774 19074
                </a>
              </div>
            </div>

            <nav aria-label="Useful links">
              <p className="font-serif text-[17px] font-semibold text-cream">Useful Links</p>
              <ul className="mt-2">
                {useful.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="inline-flex min-h-11 items-center text-[12px] text-cream/75 transition-colors hover:text-gold-light"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Information">
              <p className="font-serif text-[17px] font-semibold text-cream">Information</p>
              <ul className="mt-2">
                {information.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="inline-flex min-h-11 items-center text-[12px] text-cream/75 transition-colors hover:text-gold-light"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <p className="font-serif text-[17px] font-semibold text-cream">Reach us</p>
              <p className="mt-2 text-[12px] leading-relaxed text-cream/70">
                Walk into Jagdamba Market and ask for JMD. We will show the weight and the day&apos;s rate at the
                counter.
              </p>
              <Link
                href="/visit"
                className="mt-3 inline-flex min-h-10 items-center rounded-control border border-gold-light/60 px-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-gold-light transition-colors hover:bg-gold-light hover:text-white"
              >
                Get directions
              </Link>

              <div className="mt-5 flex flex-wrap gap-1.5">
                <PaymentBadge>UPI</PaymentBadge>
                <PaymentBadge>Visa</PaymentBadge>
                <PaymentBadge>Mastercard</PaymentBadge>
                <PaymentBadge>RuPay</PaymentBadge>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-cream/15 pt-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <a
                  href={waLink("Namaste JMD Gems & Jewellery. I would like to chat.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="grid h-11 w-11 place-items-center rounded-full bg-cream/10 text-cream/85 hover:bg-gold-light hover:text-white"
                >
                  <IconWhatsApp size={17} />
                </a>
                <a
                  href={`mailto:${SHOP.email}`}
                  aria-label="Email"
                  className="grid h-11 w-11 place-items-center rounded-full bg-cream/10 text-cream/85 hover:bg-gold-light hover:text-white"
                >
                  <IconMail size={17} />
                </a>
                <a
                  href={waLink("Namaste JMD Gems & Jewellery. I have a question.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Chat"
                  className="grid h-11 w-11 place-items-center rounded-full bg-cream/10 text-cream/85 hover:bg-gold-light hover:text-white"
                >
                  <IconChat size={17} />
                </a>
                {socials.map(({ key, href, Icon, label }) => (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="grid h-11 w-11 place-items-center rounded-full bg-cream/10 text-cream/85 hover:bg-gold-light hover:text-white"
                  >
                    <Icon size={17} />
                  </a>
                ))}
              </div>

              <p className="text-[10px] text-cream/55">
                © {new Date().getFullYear()} {SHOP.name} · Hindaun, Rajasthan
              </p>
            </div>

            <p className="mt-3 font-hindi text-[10px] tracking-[0.12em] text-gold-light/60">
              || जय माता दी || &nbsp; || श्री गणेशाय नमः || &nbsp; || जय बजरंग बली ||
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
