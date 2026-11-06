"use client";

import { useState } from "react";
import { IconDirections, IconShopfront } from "@/components/icons/JmdIcons";
import { SHOP, mapsLink, waLink } from "@/lib/utils";

export function VisitShop() {
  const [pincode, setPincode] = useState("");
  const [sent, setSent] = useState(false);

  const ask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincode)) return;
    setSent(true);
    window.open(
      waLink(`Namaste JMD Gems & Jewellery. I am checking delivery for pincode ${pincode}.`),
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <section id="visit" className="bg-cream py-14 sm:py-16">
      <div className="container-x">
        <form onSubmit={ask} className="mx-auto flex max-w-[520px] flex-col gap-2">
          <div className="flex h-12 items-center gap-2 rounded-control border border-burgundy/20 bg-white pl-5 pr-1.5">
            <label htmlFor="visit-pincode" className="sr-only">
              Your pincode
            </label>
            <input
              id="visit-pincode"
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              placeholder="Enter your pincode"
              className="min-w-0 flex-1 bg-transparent text-[13px] text-ink placeholder:text-bodygrey/70 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!/^\d{6}$/.test(pincode)}
              className="min-h-10 rounded-control bg-burgundy px-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-white disabled:opacity-40"
            >
              Ask shop
            </button>
          </div>
          <p className="px-2 text-[11px] text-burgundy">
            {sent
              ? "WhatsApp opened — the shop will confirm delivery on chat."
              : "Enter your pincode and the shop will confirm delivery on WhatsApp."}
          </p>
        </form>

        <div className="mx-auto mt-8 max-w-[560px] text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-dark">Visit the shop</p>
          <h2 className="mt-2 font-serif text-28 font-semibold text-ink sm:text-34">
            Our <span className="font-normal italic text-burgundy">Shop</span>
          </h2>
        </div>

        <div className="mx-auto mt-6 max-w-[420px]">
          <div className="arch-card flex flex-col items-center bg-white px-6 pb-7 pt-12">
            <IconShopfront size={132} className="text-burgundy/75" />
            <h3 className="mt-3 font-serif text-28 font-semibold text-ink">Hindaun</h3>
            <p className="mt-1 text-center text-[12px] font-medium text-gold-dark">
              Jagdamba Market, Mohan Nagar,
              <br />
              Hindaun-322230, Rajasthan
            </p>
          </div>

          <div className="mt-7 rounded-card bg-gradient-to-br from-burgundy to-burgundy-dark p-5 text-center shadow-card">
            <a
              href={mapsLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-control bg-white px-6 text-[10px] font-semibold uppercase tracking-[0.12em] text-burgundy transition-colors hover:bg-cream"
            >
              <IconDirections size={15} /> Get directions
            </a>
            <p className="mt-2 text-[10px] text-cream/70">
              {SHOP.address.line1} · {SHOP.address.city} {SHOP.address.pincode}
            </p>
            <p className="mt-1 text-[10px] text-gold-light/80">[CONFIRM WITH SHOP] opening hours</p>
          </div>
        </div>
      </div>
    </section>
  );
}
