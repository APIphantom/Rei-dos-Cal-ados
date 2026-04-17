"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types/product";
import type { CartLine } from "./types";

type CartState = {
  isOpen: boolean;
  lines: CartLine[];
  open: () => void;
  close: () => void;
  setOpen: (open: boolean) => void;
  add: (product: Product, size: string, color: string) => void;
  remove: (productId: string, size: string, color: string) => void;
  setQty: (productId: string, size: string, color: string, qty: number) => void;
  clear: () => void;
};

function keyOf(productId: string, size: string, color: string) {
  return `${productId}__${size}__${color}`;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      lines: [],
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      setOpen: (open) => set({ isOpen: open }),
      add: (product, size, color) => {
        const k = keyOf(product.id, size, color);
        const existing = get().lines.find((l) => keyOf(l.product.id, l.size, l.color) === k);
        if (existing) {
          set({
            lines: get().lines.map((l) =>
              keyOf(l.product.id, l.size, l.color) === k ? { ...l, quantity: l.quantity + 1 } : l
            ),
            isOpen: true,
          });
          return;
        }
        set({ lines: [...get().lines, { product, size, color, quantity: 1 }], isOpen: true });
      },
      remove: (productId, size, color) => {
        const k = keyOf(productId, size, color);
        set({ lines: get().lines.filter((l) => keyOf(l.product.id, l.size, l.color) !== k) });
      },
      setQty: (productId, size, color, qty) => {
        if (qty <= 0) {
          get().remove(productId, size, color);
          return;
        }
        const k = keyOf(productId, size, color);
        set({
          lines: get().lines.map((l) =>
            keyOf(l.product.id, l.size, l.color) === k ? { ...l, quantity: qty } : l
          ),
        });
      },
      clear: () => set({ lines: [] }),
    }),
    {
      name: "rdc_cart_v1",
      partialize: (state) => ({ lines: state.lines }),
    }
  )
);

export function useCartTotals() {
  const lines = useCartStore((s) => s.lines);
  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);
  const total = lines.reduce((sum, l) => sum + l.product.price * l.quantity, 0);
  return { itemCount, total };
}

