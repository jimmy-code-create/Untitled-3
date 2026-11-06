"use client";

import { create } from "zustand";

export interface ToastItem {
  id: number;
  title: string;
  sub?: string;
}

interface ToastState {
  toasts: ToastItem[];
  push: (title: string, sub?: string) => void;
  remove: (id: number) => void;
}

let counter = 1;

export const useToast = create<ToastState>((set) => ({
  toasts: [],
  push: (title, sub) => {
    const id = counter++;
    set((s) => ({ toasts: [...s.toasts, { id, title, sub }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3600);
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
