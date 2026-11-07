import { RateEditor } from "@/components/admin/RateEditor";
import { getRateCards, listAudit } from "@/lib/rates";
import { getSettings } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default async function AdminRatesPage() {
  const [cards, settings, audit] = await Promise.all([getRateCards(), getSettings(), listAudit(50)]);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[9px] uppercase tracking-widest2 text-copper-dark">Live rate control</p>
        <h1 className="mt-1 font-serif text-3xl text-white">Gold &amp; silver rates</h1>
        <p className="mt-1 max-w-2xl text-[11.5px] leading-relaxed text-stone">
          The ticker, product cards, product pages and checkout all use these rates. A feed move above 3% is held
          for your approval instead of being published automatically.
        </p>
      </div>

      <RateEditor
        cards={cards}
        config={settings.rateConfig}
        audit={audit}
        liveConfigured={Boolean(process.env.METAL_API_KEY)}
      />
    </div>
  );
}
