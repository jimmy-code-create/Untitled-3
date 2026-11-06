"use client";

import { useState } from "react";
import { MessageCircle, Phone } from "lucide-react";
import type { DemoEnquiry } from "@/lib/demo-db";
import { useToast } from "@/store/toast";
import { cn, formatDate, waLink } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  NEW: "bg-marigold/10 text-marigold",
  CONTACTED: "bg-copper/10 text-copper-dark",
  CLOSED: "bg-stone/10 text-stone",
};

export function EnquiriesTable({ enquiries }: { enquiries: DemoEnquiry[] }) {
  const push = useToast((s) => s.push);
  const [rows, setRows] = useState(enquiries);

  const setStatus = async (id: string, status: "CONTACTED" | "CLOSED") => {
    const res = await fetch("/api/enquiries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    const data = await res.json();
    if (!data.ok) {
      push("Could not update", data.error);
      return;
    }
    setRows((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
  };

  return (
    <div className="space-y-3">
      {rows.map((e) => (
        <article key={e.id} className="border border-copper/20 bg-white p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[12px] text-navy">{e.name}</p>
                <span className={cn("px-2 py-0.5 text-[8px] uppercase tracking-widest2", STATUS_STYLES[e.status])}>{e.status}</span>
                <span className="text-[8px] uppercase tracking-widest2 text-stone">{e.type.replace("_", " ")}</span>
              </div>
              <p className="mt-0.5 text-[10px] text-stone">
                {formatDate(e.createdAt)} · {e.productName ? `About: ${e.productName}` : "General"}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <a href={`tel:+91${e.phone}`} className="grid h-8 w-8 place-items-center border border-copper/25 text-copper-dark hover:bg-copper hover:text-white" aria-label="Call">
                <Phone className="h-3.5 w-3.5" />
              </a>
              <a href={waLink(`Namaste ${e.name}, JMD Gems & Jewellery se. Aapki enquiry ke baare mein…`)} target="_blank" rel="noopener noreferrer" className="grid h-8 w-8 place-items-center border border-copper/25 text-whatsapp hover:bg-whatsapp hover:text-white" aria-label="WhatsApp">
                <MessageCircle className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
          {e.message && <p className="mt-2 border-t border-copper/10 pt-2 text-[11.5px] leading-relaxed text-charcoal/75">“{e.message}”</p>}
          <div className="mt-2 flex gap-2">
            <button onClick={() => setStatus(e.id, "CONTACTED")} className="border border-copper/30 px-2.5 py-1 text-[9px] uppercase tracking-wider text-copper-dark hover:bg-copper/10">
              Mark contacted
            </button>
            <button onClick={() => setStatus(e.id, "CLOSED")} className="border border-copper/30 px-2.5 py-1 text-[9px] uppercase tracking-wider text-stone hover:bg-stone/5">
              Close
            </button>
            <span className="ml-auto text-[10px] text-stone">{e.phone}</span>
          </div>
        </article>
      ))}
      {rows.length === 0 && <p className="border border-copper/20 bg-white px-4 py-10 text-center text-[11.5px] text-stone">No enquiries yet.</p>}
    </div>
  );
}
