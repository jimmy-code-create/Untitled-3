"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { FloatingHelper } from "./FloatingHelper";
import { OldGoldPopup } from "./OldGoldPopup";
import { ScrollReveal } from "./ScrollReveal";
import type { RateMap } from "@/lib/pricing";
import type { ShopSettings } from "@/lib/settings";

export function ChromeGate({
  rates,
  rateUpdatedAt,
  staleLabel,
  settings,
  children,
}: {
  rates: RateMap;
  rateUpdatedAt?: string;
  staleLabel?: string | null;
  settings: ShopSettings;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) return <>{children}</>;

  return (
    <>
      <Navbar
        rates={rates}
        rateUpdatedAt={rateUpdatedAt}
        staleLabel={staleLabel}
        settings={settings}
      />
      <main>{children}</main>
      <Footer settings={settings} />
      <ScrollReveal />
      <FloatingHelper />
      <OldGoldPopup settings={settings} />
    </>
  );
}
