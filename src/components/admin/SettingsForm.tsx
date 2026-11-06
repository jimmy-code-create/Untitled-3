"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ShopSettings } from "@/lib/settings";

const fieldLabel = "text-[10px] font-semibold uppercase tracking-[0.1em] text-bodygrey";

export function SettingsForm({ settings }: { settings: ShopSettings }) {
  const router = useRouter();
  const [form, setForm] = useState(settings);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const save = async (patch: Partial<ShopSettings>) => {
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Could not save");
      setMessage("Saved. The storefront will refresh on the next request.");
      router.refresh();
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-card border border-burgundy/10 bg-white p-5 shadow-card">
        <h2 className="font-serif text-xl text-navy">Announcement &amp; offers</h2>
        <p className="mt-1 text-[11px] text-stone">
          Only what you type here appears on the site. Empty offer fields show <strong>[OFFER]</strong>.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className={fieldLabel}>Announcement bar text</span>
            <input
              value={form.announcementText}
              onChange={(e) => setForm({ ...form, announcementText: e.target.value })}
              className="field mt-1"
              maxLength={120}
            />
          </label>
          <label>
            <span className={fieldLabel}>Offer headline</span>
            <input
              value={form.offerHeadline}
              onChange={(e) => setForm({ ...form, offerHeadline: e.target.value })}
              className="field mt-1"
              maxLength={40}
            />
          </label>
          <label>
            <span className={fieldLabel}>Offer sub-line</span>
            <input
              value={form.offerSub}
              onChange={(e) => setForm({ ...form, offerSub: e.target.value })}
              className="field mt-1"
              maxLength={60}
            />
          </label>
          <label>
            <span className={fieldLabel}>Gift starting price (display text)</span>
            <input
              value={form.giftStartingPrice ?? ""}
              onChange={(e) => setForm({ ...form, giftStartingPrice: e.target.value || null })}
              placeholder="Leave blank for [CONFIRM WITH SHOP]"
              className="field mt-1"
              maxLength={40}
            />
          </label>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() =>
            save({
              announcementText: form.announcementText,
              offerHeadline: form.offerHeadline,
              offerSub: form.offerSub,
              giftStartingPrice: form.giftStartingPrice,
            })
          }
          className="btn-copper mt-4"
        >
          Save announcement
        </button>
      </section>

      <section className="rounded-card border border-burgundy/10 bg-white p-5 shadow-card">
        <h2 className="font-serif text-xl text-navy">Assurances &amp; old gold</h2>
        <p className="mt-1 text-[11px] text-stone">
          Only switched-on assurances appear on the home page. Keep a toggle off until the shop confirms the policy.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {(
            [
              ["purity", "Purity Guarantee"],
              ["exchange", "Old Gold Exchange"],
              ["replacement", "Easy Replacement"],
              ["maintenance", "Lifetime Maintenance"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex min-h-11 items-center justify-between gap-3 rounded-[14px] border border-burgundy/10 bg-cream px-3">
              <span className="text-[12px] text-ink">{label}</span>
              <input
                type="checkbox"
                checked={form.assurance[key]}
                onChange={(e) =>
                  setForm({ ...form, assurance: { ...form.assurance, [key]: e.target.checked } })
                }
                className="h-4 w-4 accent-[#7A1F2B]"
              />
            </label>
          ))}
        </div>

        <label className="mt-4 block">
          <span className={fieldLabel}>Old gold / exchange note</span>
          <textarea
            value={form.exchangeNote ?? ""}
            onChange={(e) => setForm({ ...form, exchangeNote: e.target.value || null })}
            rows={2}
            maxLength={140}
            placeholder="Leave blank for [CONFIRM WITH SHOP]"
            className="field mt-1 rounded-[18px]"
          />
        </label>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <label>
            <span className={fieldLabel}>Popup text (old gold)</span>
            <input
              value={form.popupText ?? ""}
              onChange={(e) => setForm({ ...form, popupText: e.target.value || null })}
              placeholder="Leave blank for [CONFIRM WITH SHOP]"
              className="field mt-1"
              maxLength={200}
            />
          </label>
          <label className="flex min-h-11 items-center gap-2 rounded-control border border-burgundy/10 bg-cream px-4 text-[12px] text-ink">
            <input
              type="checkbox"
              checked={form.popupEnabled}
              onChange={(e) => setForm({ ...form, popupEnabled: e.target.checked })}
              className="h-4 w-4 accent-[#7A1F2B]"
            />
            Popup on
          </label>
        </div>

        <button
          type="button"
          disabled={busy}
          onClick={() =>
            save({
              assurance: form.assurance,
              exchangeNote: form.exchangeNote,
              popupText: form.popupText,
              popupEnabled: form.popupEnabled,
            })
          }
          className="btn-copper mt-4"
        >
          Save assurances
        </button>
      </section>

      <section className="rounded-card border border-burgundy/10 bg-white p-5 shadow-card">
        <h2 className="font-serif text-xl text-navy">Social profiles</h2>
        <p className="mt-1 text-[11px] text-stone">
          Icons appear in the footer only when a real profile URL is entered.
        </p>
        <div className="mt-4 grid gap-3">
          {(
            [
              ["instagram", "Instagram URL"],
              ["facebook", "Facebook URL"],
              ["youtube", "YouTube URL"],
            ] as const
          ).map(([key, label]) => (
            <label key={key}>
              <span className={fieldLabel}>{label}</span>
              <input
                value={form.socials[key]}
                onChange={(e) => setForm({ ...form, socials: { ...form.socials, [key]: e.target.value } })}
                placeholder="https://…"
                className="field mt-1"
                maxLength={200}
              />
            </label>
          ))}
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => save({ socials: form.socials })}
          className="btn-copper mt-4"
        >
          Save socials
        </button>
      </section>

      {message ? <p className="text-[11px] text-burgundy">{message}</p> : null}
    </div>
  );
}
