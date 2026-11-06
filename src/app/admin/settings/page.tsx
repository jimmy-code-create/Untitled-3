import { SettingsForm } from "@/components/admin/SettingsForm";
import { getSettings } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSettings();
  return (
    <div className="space-y-5">
      <div>
        <p className="text-[9px] uppercase tracking-widest2 text-copper-dark">Storefront content</p>
        <h1 className="mt-1 font-serif text-3xl text-navy">Content &amp; claims</h1>
        <p className="mt-1 max-w-2xl text-[11.5px] leading-relaxed text-stone">
          Every customer-facing claim, offer number and policy line is controlled here. Leave a field blank and the
          site shows <strong>[CONFIRM WITH SHOP]</strong> instead of inventing a fact.
        </p>
      </div>
      <SettingsForm settings={settings} />
    </div>
  );
}
