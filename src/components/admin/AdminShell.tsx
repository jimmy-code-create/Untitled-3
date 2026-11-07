"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  BarChart3,
  Box,
  Coins,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  ShoppingBag,
  Users,
  X,
  Camera,
  Settings2,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Box },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/rates", label: "Gold & silver rates", icon: Coins },
  { href: "/admin/settings", label: "Content & claims", icon: Settings2 },
  { href: "/admin/enquiries", label: "Enquiries", icon: MessageSquare },
  { href: "/admin/users", label: "Customers", icon: Users },
  { href: "/admin/checklist", label: "Photo guide & to-do", icon: Camera },
];

export function AdminShell({
  children,
  name,
}: {
  children: React.ReactNode;
  name: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="space-y-1">
      {NAV.map((item) => {
        const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 text-[11.5px] transition-colors",
              active ? "bg-copper/15 text-copper-dark" : "text-ivory/65 hover:bg-white/5 hover:text-ivory",
            )}
          >
            <item.icon className="h-4 w-4" strokeWidth={1.4} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#0B0B0B]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col bg-navy px-4 py-6 lg:flex">
        <div className="px-2">
          <Logo variant="light" size="sm" />
        </div>
        <p className="mb-6 mt-6 px-3 text-[9px] uppercase tracking-widest2 text-copper/60">Store dashboard</p>
        {nav}
        <div className="mt-auto space-y-2 border-t border-white/10 pt-4">
          <Link href="/" target="_blank" className="flex items-center gap-2.5 px-3 py-2 text-[11px] text-ivory/60 hover:text-copper-light">
            <ExternalLink className="h-3.5 w-3.5" /> View storefront
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-[11px] text-ivory/60 hover:text-copper-light"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
          <p className="px-3 pt-2 text-[9px] text-ivory/30">Signed in as {name}</p>
        </div>
      </aside>

      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-copper/20 bg-white/[0.04] px-4 backdrop-blur sm:px-6">
          <button onClick={() => setOpen(true)} className="text-white lg:hidden" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden items-center gap-2 text-[10px] uppercase tracking-widest2 text-stone sm:flex">
            <BarChart3 className="h-3.5 w-3.5 text-copper-dark" /> JMD Gems &amp; Jewellery · Hindaun
          </div>
          <Link href="/" target="_blank" className="btn-outline px-3 py-1.5 text-[9px]">
            Storefront <ExternalLink className="h-3 w-3" />
          </Link>
        </header>
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-navy/60" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[80%] max-w-xs bg-navy p-5">
            <div className="flex items-center justify-between">
              <Logo variant="light" size="sm" />
              <button onClick={() => setOpen(false)} className="text-ivory" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-8">{nav}</div>
          </div>
        </div>
      )}
    </div>
  );
}
