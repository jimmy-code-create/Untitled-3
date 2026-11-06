"use client";

import { SessionProvider } from "next-auth/react";
import { LangProvider } from "./LangProvider";
import { Toaster } from "@/components/ui/Toaster";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LangProvider>
        {children}
        <Toaster />
      </LangProvider>
    </SessionProvider>
  );
}
