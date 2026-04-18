import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LocalOrder, OrderStatus } from "@/types/local-order";

type LocalOrdersState = {
  orders: LocalOrder[];
  add: (o: Omit<LocalOrder, "id">) => string;
  updateStatus: (id: string, status: OrderStatus) => void;
  remove: (id: string) => void;
};

function genId(): string {
  return `local_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

export const useLocalOrdersStore = create<LocalOrdersState>()(
  persist(
    (set) => ({
      orders: [],
      add: (o) => {
        const id = genId();
        set((s) => ({ orders: [{ id, ...o }, ...s.orders] }));
        return id;
      },
      updateStatus: (id, status) => {
        set((s) => ({
          orders: s.orders.map((x) => (x.id === id ? { ...x, status } : x)),
        }));
      },
      remove: (id) => {
        set((s) => ({ orders: s.orders.filter((x) => x.id !== id) }));
      },
    }),
    {
      name: "rdc-local-orders-v1",
      partialize: (s) => ({ orders: s.orders }),
    }
  )
);

export function selectLocalOrderMetrics(orders: LocalOrder[]) {
  const paid = orders.filter((o) => o.status === "paid");
  const pending = orders.filter((o) => o.status === "pending");
  const revenuePaid = paid.reduce((acc, o) => acc + o.amount, 0);
  const totalPending = pending.reduce((acc, o) => acc + o.amount, 0);
  return {
    paidCount: paid.length,
    pendingCount: pending.length,
    revenuePaid,
    totalPending,
  };
}
