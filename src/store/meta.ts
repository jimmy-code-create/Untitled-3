"use client";

import { create } from "zustand";

interface MetaState {
  productName: string | null;
  productSlug: string | null;
  setProduct: (name: string | null, slug: string | null) => void;
}

export const usePageMeta = create<MetaState>((set) => ({
  productName: null,
  productSlug: null,
  setProduct: (productName, productSlug) => set({ productName, productSlug }),
}));
