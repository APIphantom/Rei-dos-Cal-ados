"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types/product";
import { maxQtyForCartLine, sanitizeCartLines } from "@/features/cart/variant-stock";
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

function linesFromPersistPayload(persistedState: unknown): CartLine[] | undefined {
  if (!persistedState || typeof persistedState !== "object") return undefined;
  const o = persistedState as Record<string, unknown>;
  if (Array.isArray(o.lines)) return o.lines as CartLine[];
  if (o.state && typeof o.state === "object") {
    const st = o.state as Record<string, unknown>;
    if (Array.isArray(st.lines)) return st.lines as CartLine[];
  }
  return undefined;
}

function mergePersistedCart(persistedState: unknown, currentState: CartState): CartState {
  const raw = linesFromPersistPayload(persistedState);
  const lines = raw !== undefined ? sanitizeCartLines(raw) : currentState.lines;
  return { ...currentState, lines };
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
          const cap = maxQtyForCartLine(product, size, color);
          const next = Math.min(existing.quantity + 1, cap);
          if (cap <= 0 || next <= 0) return;
          if (next === existing.quantity) return;
          set({
            lines: get().lines.map((l) =>
              keyOf(l.product.id, l.size, l.color) === k ? { ...l, product, quantity: next } : l
            ),
            isOpen: true,
          });
          return;
        }
        const max = maxQtyForCartLine(product, size, color);
        if (max <= 0) return;
        set({
          lines: [...get().lines, { product, size, color, quantity: Math.min(1, max) }],
          isOpen: true,
        });
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
        const line = get().lines.find((l) => keyOf(l.product.id, l.size, l.color) === k);
        if (!line) return;
        const max = maxQtyForCartLine(line.product, size, color);
        if (max <= 0) {
          get().remove(productId, size, color);
          return;
        }
        const next = Math.min(Math.floor(qty), max);
        if (next <= 0) {
          get().remove(productId, size, color);
          return;
        }
        set({
          lines: get().lines.map((l) =>
            keyOf(l.product.id, l.size, l.color) === k ? { ...l, quantity: next } : l
          ),
        });
      },
      clear: () => set({ lines: [] }),
    }),
    {
      name: "rdc_cart_v1",
      partialize: (state) => ({ lines: state.lines }),
      merge: mergePersistedCart,
    }
  )
);

export function useCartTotals() {
  const lines = useCartStore((s) => s.lines);
  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);
  const total = lines.reduce((sum, l) => sum + l.product.price * l.quantity, 0);
  return { itemCount, total };
}

