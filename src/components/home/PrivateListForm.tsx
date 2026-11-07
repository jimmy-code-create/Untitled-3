"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";

/**
 * The hero's email capture. Posts to the existing /api/newsletter route, which
 * stores the address as a NEWSLETTER enquiry so the shop sees it in admin.
 */
export function PrivateListForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (state === "sending") return;
    setState("sending");
    setMessage("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setState("error");
        setMessage(data?.error || "That did not go through. Please try again.");
        return;
      }

      setState("done");
      setEmail("");
      setMessage("You are on the list. We will write when something new arrives.");
    } catch {
      setState("error");
      setMessage("No connection. Please try again.");
    }
  }

  return (
    <form onSubmit={submit} className="w-full max-w-[520px]">
      <label htmlFor="private-list-email" className="sr-only">
        Email address
      </label>

      <div className="liquid-glass flex items-center gap-2 rounded-full p-1.5 pl-5 focus-within:border-white/35">
        <input
          id="private-list-email"
          type="email"
          required
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (state !== "idle") setState("idle");
          }}
          placeholder="Join the private list"
          autoComplete="email"
          className="min-h-11 min-w-0 flex-1 bg-transparent text-[14px] text-white placeholder:text-white/45 focus:outline-none sm:text-[15px]"
        />
        <button
          type="submit"
          disabled={state === "sending"}
          aria-label="Join the private list"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-black transition duration-200 hover:scale-[1.04] active:scale-[0.96] disabled:opacity-70"
        >
          {state === "done" ? (
            <Check className="h-4 w-4" strokeWidth={2} aria-hidden />
          ) : state === "sending" ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-black/25 border-t-black" />
          ) : (
            <ArrowRight className="h-4 w-4" strokeWidth={1.8} aria-hidden />
          )}
        </button>
      </div>

      <p
        aria-live="polite"
        className={
          state === "error"
            ? "mt-2 pl-1 text-left text-[11.5px] text-[#FFB4A8]"
            : "mt-2 pl-1 text-left text-[11.5px] text-white/55"
        }
      >
        {message ||
          "New arrivals, festival collections and today's rate — occasional messages, never spam."}
      </p>
    </form>
  );
}
