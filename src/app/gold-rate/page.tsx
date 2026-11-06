import type { Metadata } from "next";
import { GoldRateView } from "@/components/rates/GoldRateView";
import { getHistorySeries, getPublicRates } from "@/lib/rates";

export const metadata: Metadata = {
  title: "Today's Gold Rate in Hindaun",
  description:
    "Today's 24K, 22K and 18K gold rate and silver rate at JMD Gems & Jewellery, Jagdamba Market, Hindaun. Indicative rates; final price is as per billing at the shop.",
  alternates: { canonical: "/gold-rate" },
};

export const dynamic = "force-dynamic";

export default async function GoldRatePage() {
  const [rates, history] = await Promise.all([getPublicRates(), getHistorySeries(30)]);

  return (
    <GoldRateView
      initial={rates}
      history={history.map((h) => ({
        purity: h.purity,
        ratePerGram: h.ratePerGram,
        fetchedAt: h.fetchedAt,
      }))}
    />
  );
}
