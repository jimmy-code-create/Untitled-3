"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartLine {
  slug: string;
  name: string;
  image: string;
  price: number;
  size?: string;
  quantity: number;
  metal: string;
  purity: string;
  weight: number;
  /** Set when the line is added, and refreshed by /api/cart/quote. */
  rateSnapshotId?: string;
  addedAt?: number;
}

interface CartState {
  lines: CartLine[];
  add: (line: CartLine) => void;
  stampSnapshot: (snapshotId: string) => void;
  remove: (slug: string, size?: string) => void;
  setQty: (slug: string, size: string | undefined, quantity: number) => void;
  clear: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (line) =>
        set((state) => {
          const withMeta = { ...line, addedAt: line.addedAt ?? Date.now() };
          const idx = state.lines.findIndex((l) => l.slug === line.slug && l.size === line.size);
          if (idx >= 0) {
            const lines = [...state.lines];
            lines[idx] = { ...lines[idx], quantity: lines[idx].quantity + line.quantity };
            return { lines };
          }
          return { lines: [...state.lines, withMeta] };
        }),
      stampSnapshot: (snapshotId) =>
        set((state) => ({
          lines: state.lines.map((line) => ({ ...line, rateSnapshotId: snapshotId })),
        })),
      remove: (slug, size) =>
        set((state) => ({ lines: state.lines.filter((l) => !(l.slug === slug && l.size === size)) })),
      setQty: (slug, size, quantity) =>
        set((state) => ({
          lines: state.lines
            .map((l) => (l.slug === slug && l.size === size ? { ...l, quantity: Math.max(1, quantity) } : l))
            .filter((l) => l.quantity > 0),
        })),
      clear: () => set({ lines: [] }),
    }),
    { name: "jmd-cart-v1" },
  ),
);

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.quantity, 0);
export const cartSubtotal = (lines: CartLine[]) => lines.reduce((n, l) => n + l.price * l.quantity, 0);

export interface WishItem {
  slug: string;
  name: string;
  image: string;
  price: number;
  metal: string;
}

interface WishState {
  items: WishItem[];
  toggle: (item: WishItem) => void;
  remove: (slug: string) => void;
  has: (slug: string) => boolean;
}

export const useWishlist = create<WishState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (item) =>
        set((state) => {
          const exists = state.items.some((i) => i.slug === item.slug);
          return { items: exists ? state.items.filter((i) => i.slug !== item.slug) : [...state.items, item] };
        }),
      remove: (slug) => set((state) => ({ items: state.items.filter((i) => i.slug !== slug) })),
      has: (slug) => get().items.some((i) => i.slug === slug),
    }),
    { name: "jmd-wishlist-v1" },
  ),
);
