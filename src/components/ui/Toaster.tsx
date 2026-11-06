"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { useToast } from "@/store/toast";

export function Toaster() {
  const { toasts, remove } = useToast();
  return (
    <div className="pointer-events-none fixed bottom-24 left-4 z-[80] flex flex-col gap-2 sm:left-6">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.button
            key={t.id}
            type="button"
            onClick={() => remove(t.id)}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            className="pointer-events-auto flex max-w-xs items-start gap-3 border border-copper/25 bg-white/97 px-4 py-3 text-left shadow-soft backdrop-blur"
          >
            <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-whatsapp/15 text-whatsapp">
              <Check className="h-3 w-3" strokeWidth={2} />
            </span>
            <span>
              <span className="block text-[12px] font-medium text-navy">{t.title}</span>
              {t.sub && <span className="mt-0.5 block text-[10.5px] text-stone">{t.sub}</span>}
            </span>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
