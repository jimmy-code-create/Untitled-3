"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { IconClose } from "@/components/icons/JmdIcons";
import { PLACEHOLDER, type ShopSettings } from "@/lib/settings";

/**
 * Old-gold enquiry popup. Appears once per browser session after 8 seconds,
 * never on checkout or the admin. The copy and terms come from /admin/settings.
 */
export function OldGoldPopup({ settings }: { settings: ShopSettings }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const blocked =
    !settings.popupEnabled ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/login");

  useEffect(() => {
    if (blocked) return;
    try {
      if (sessionStorage.getItem("jmd-oldgold-seen") === "1") return;
    } catch {
      /* private mode */
    }
    const timer = window.setTimeout(() => setOpen(true), 8000);
    return () => window.clearTimeout(timer);
  }, [blocked]);

  const close = () => {
    setOpen(false);
    try {
      sessionStorage.setItem("jmd-oldgold-seen", "1");
    } catch {
      /* private mode */
    }
  };

  const valid = name.trim().length > 1 && /^\d{10}$/.test(phone);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          message: `Old gold exchange enquiry${settings.exchangeNote ? ` — ${settings.exchangeNote}` : ""}`,
          type: "OLD_GOLD",
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Could not send enquiry");
      setDone(true);
      window.setTimeout(close, 2200);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-burgundy-dark/50 p-4 backdrop-blur-[2px]">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="oldgold-title"
        className="relative w-full max-w-[390px] rounded-modal bg-black px-5 py-7 shadow-popup sm:px-7"
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-2 top-2 grid h-11 w-11 place-items-center rounded-full text-burgundy/70 hover:bg-blush"
        >
          <IconClose size={17} />
        </button>

        <div className="flex justify-center">
          <Logo size="sm" />
        </div>

        <h2 id="oldgold-title" className="mt-4 text-center font-serif text-[24px] font-semibold leading-tight text-burgundy">
          Old gold exchange
        </h2>
        <p className="mt-2 text-center text-[12px] leading-relaxed text-bodygrey">
          {settings.exchangeNote ?? `${PLACEHOLDER} — valuation and exchange terms.`}
        </p>

        {done ? (
          <p className="mt-6 rounded-control bg-white/[0.04] px-4 py-4 text-center text-[12px] text-burgundy">
            Dhanyavaad. We will call you about your old gold.
          </p>
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              aria-label="Your name"
              className="field"
              autoComplete="name"
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="Phone number"
              aria-label="Phone number"
              inputMode="numeric"
              autoComplete="tel"
              className="field"
            />
            {error ? <p className="text-[11px] text-burgundy">{error}</p> : null}
            <button
              type="submit"
              disabled={!valid || sending}
              className={`flex min-h-11 w-full items-center justify-center rounded-control px-5 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                valid
                  ? "bg-white text-black hover:bg-burgundy-dark"
                  : "cursor-not-allowed bg-[#d9a8b0]/70 text-white/90"
              }`}
            >
              {sending ? "Sending…" : "Request a call back"}
            </button>
            <p className="text-center text-[10px] leading-relaxed text-bodygrey/80">
              Your number is used only to answer this enquiry.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
