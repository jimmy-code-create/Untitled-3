"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, getProviders } from "next-auth/react";
import { ArrowLeft, KeyRound, Lock, Phone, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { useToast } from "@/store/toast";
import { cn } from "@/lib/utils";

export function LoginForm({ next = "/account", adminReason = false }: { next?: string; adminReason?: boolean }) {
  const router = useRouter();
  const push = useToast((s) => s.push);
  const [mode, setMode] = useState<"otp" | "admin">(adminReason ? "admin" : "otp");
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [admin, setAdmin] = useState({ email: "admin@jmdgems.in", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [providers, setProviders] = useState<string[]>([]);

  useEffect(() => {
    getProviders().then((p) => setProviders(Object.keys(p ?? {})));
  }, []);

  const requestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!/^\d{10}$/.test(phone)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setStep("code");
      if (data.devCode) setDevCode(data.devCode);
      push("OTP sent", data.devCode ? `Demo code: ${data.devCode}` : `Sent to ${phone}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("phone-otp", { phone, code, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError(res.error.includes("CredentialsSignin") ? "Incorrect or expired OTP." : res.error);
      return;
    }
    router.push(next);
    router.refresh();
  };

  const adminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("admin", { email: admin.email, password: admin.password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Those admin details were not recognised.");
      return;
    }
    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="mx-auto grid max-w-4xl overflow-hidden border border-copper/20 bg-white lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-navy p-10 lg:flex">
        <Logo variant="light" size="md" />
        <div>
          <p className="font-hindi text-[11px] leading-relaxed tracking-widest2 text-copper/70">
            || जय माता दी || || श्री गणेशाय नमः ||
          </p>
          <h2 className="mt-5 font-serif text-3xl leading-tight text-ivory">
            Your orders,
            <br />
            <span className="italic text-copper-light">your family jeweller.</span>
          </h2>
          <p className="mt-3 max-w-xs text-[12px] leading-relaxed text-ivory/55">
            Sign in with your mobile number to track orders, save addresses and keep your wishlist in one place.
          </p>
          <div className="mt-6 space-y-2 text-[11px] text-ivory/45">
            <p className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-copper" /> BIS hallmarked, always</p>
            <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-copper" /> +91 7891384376</p>
          </div>
        </div>
        <p className="text-[9px] uppercase tracking-widest2 text-ivory/25">Jagdamba Market · Mohan Nagar · Hindaun</p>
      </div>

      <div className="p-6 sm:p-10">
        <div className="mb-6 flex gap-1 border border-copper/20 p-1">
          <button
            onClick={() => { setMode("otp"); setError(""); }}
            className={cn(
              "flex-1 py-2 text-[10px] uppercase tracking-widest2 transition-colors",
              mode === "otp" ? "bg-copper text-white" : "text-stone hover:text-copper-dark",
            )}
          >
            Customer
          </button>
          <button
            onClick={() => { setMode("admin"); setError(""); }}
            className={cn(
              "flex-1 py-2 text-[10px] uppercase tracking-widest2 transition-colors",
              mode === "admin" ? "bg-navy text-ivory" : "text-stone hover:text-copper-dark",
            )}
          >
            Store admin
          </button>
        </div>

        {mode === "otp" ? (
          step === "phone" ? (
            <form onSubmit={requestOtp} className="space-y-4">
              <div>
                <p className="label mb-2">Mobile number</p>
                <div className="flex items-center border border-copper/30 focus-within:border-copper">
                  <span className="border-r border-copper/25 px-3 py-3 text-[12px] text-stone">+91</span>
                  <input
                    autoFocus
                    inputMode="numeric"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="98765 43210"
                    className="w-full bg-transparent px-3 py-3 text-sm focus:outline-none"
                  />
                </div>
              </div>
              {error && <p className="text-[11px] text-ruby">{error}</p>}
              <button type="submit" disabled={loading} className="btn-copper w-full">
                {loading ? "Sending OTP…" : "Send OTP"}
              </button>
              <p className="text-center text-[10px] leading-relaxed text-stone">
                By continuing you agree to be contacted on WhatsApp about your order.
              </p>
            </form>
          ) : (
            <form onSubmit={verify} className="space-y-4">
              <button type="button" onClick={() => setStep("phone")} className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest2 text-stone hover:text-copper-dark">
                <ArrowLeft className="h-3 w-3" /> Change number
              </button>
              <div>
                <p className="label mb-2">Enter the 6-digit OTP</p>
                <input
                  autoFocus
                  inputMode="numeric"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="••••••"
                  className="field text-center text-2xl tracking-[0.6em]"
                />
                <p className="mt-2 text-[10.5px] text-stone">Sent to +91 {phone}</p>
                {devCode && (
                  <p className="mt-2 border border-copper/25 bg-lilacsoft px-3 py-2 text-[10.5px] text-copper-dark">
                    Demo mode — your OTP is <span className="font-medium tracking-widest">{devCode}</span>
                  </p>
                )}
              </div>
              {error && <p className="text-[11px] text-ruby">{error}</p>}
              <button type="submit" disabled={loading} className="btn-copper w-full">
                {loading ? "Verifying…" : "Verify & sign in"}
              </button>
              <button type="button" onClick={requestOtp} className="w-full text-[10px] uppercase tracking-widest2 text-copper-dark">
                Resend OTP
              </button>
            </form>
          )
        ) : (
          <form onSubmit={adminLogin} className="space-y-4">
            <div className="flex items-center gap-2 text-copper-dark">
              <Lock className="h-4 w-4" strokeWidth={1.4} />
              <p className="text-[10px] uppercase tracking-widest2">Restricted access</p>
            </div>
            <div>
              <p className="label mb-2">Email</p>
              <input value={admin.email} onChange={(e) => setAdmin({ ...admin, email: e.target.value })} className="field" />
            </div>
            <div>
              <p className="label mb-2">Password</p>
              <input
                type="password"
                value={admin.password}
                onChange={(e) => setAdmin({ ...admin, password: e.target.value })}
                className="field"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-[11px] text-ruby">{error}</p>}
            <button type="submit" disabled={loading} className="btn-navy w-full">
              <KeyRound className="h-3.5 w-3.5" /> {loading ? "Checking…" : "Enter dashboard"}
            </button>
            <p className="border border-copper/20 bg-lilacsoft p-3 text-[10px] leading-relaxed text-stone">
              Demo credentials: <span className="text-charcoal">admin@jmdgems.in</span> ·{" "}
              <span className="text-charcoal">JmdAdmin@2026</span>
            </p>
          </form>
        )}

        {providers.includes("google") && (
          <button
            onClick={() => signIn("google", { callbackUrl: next })}
            className="btn-outline mt-3 w-full normal-case tracking-normal"
          >
            <span className="font-sans text-[11px]">Continue with Google</span>
          </button>
        )}
      </div>
    </div>
  );
}
