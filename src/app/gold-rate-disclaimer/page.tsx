import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { getRateRows } from "@/lib/repo";
import { inr } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Gold rate disclaimer",
  description:
    "Rates shown on the JMD Gems & Jewellery website are indicative. The rate used on your bill is the rate at the counter at the time of billing.",
  alternates: { canonical: "/gold-rate-disclaimer" },
};

export const revalidate = 300;

export default async function GoldRateDisclaimerPage() {
  const rows = await getRateRows();

  return (
    <PageShell>
      <div className="container-x">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)] lg:gap-16">
          <div className="measure">
            <p className="label">Rates</p>
            <h1 className="mt-4 text-28 sm:text-44">The rate on your bill is the rate at billing</h1>

            <div className="mt-7 space-y-5 text-16 text-charcoal/80">
              <p>
                Gold and silver rates move during the day. The rate shown on this website is indicative — it is
                the rate last entered by the shop, and it may be a few hours old.
              </p>
              <p>
                When you buy, the bill is calculated on the rate at the counter at the time of billing, on the
                weight of the piece you actually take. Nothing on this website is a fixed-price offer.
              </p>
              <p className="border-l-2 border-copper/50 pl-4 text-14 text-stone">
                [CONFIRM WITH SHOP] how often the shop updates the rate (once a day, twice a day, or on request)
                and whether the rate is locked once an order is placed. Do not promise rate locking unless the
                shop agrees to it.
              </p>
            </div>

            <h2 className="mt-10 text-20">What the price on a product page includes</h2>
            <ul className="mt-3 space-y-2 text-14 text-charcoal/80">
              <li>Metal value = weight in grams × the day&apos;s rate for that purity.</li>
              <li>Gemstone value, where a stone is set, stated separately.</li>
              <li>Making charges, as entered by the shop for that piece.</li>
              <li>GST, as applicable at billing.</li>
            </ul>
          </div>

          <aside className="border border-navy/15 p-6">
            <p className="label">Rate last entered</p>
            <table className="mt-4 w-full text-14">
              <caption className="sr-only">Indicative metal rates per gram</caption>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.purity} className="border-b border-navy/10 last:border-0">
                    <th scope="row" className="py-2 text-left font-normal text-charcoal/70">
                      {r.purity.replace("SILVER_", "Silver ")}
                    </th>
                    <td className="py-2 text-right text-navy">{inr(r.ratePerGram)}/g</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 text-12 text-stone">
              {rows[0] ? `Updated ${new Date(rows[0].updatedAt).toLocaleString("en-IN")}` : "No rate recorded yet."}
            </p>
            <Button href="/contact" variant="outline" className="mt-5 w-full">
              Ask today&apos;s rate
            </Button>
          </aside>
        </div>
      </div>
    </PageShell>
  );
}
