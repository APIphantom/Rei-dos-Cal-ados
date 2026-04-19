"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLocalOrdersStore, selectLocalOrderMetrics } from "@/features/admin/local-orders-store";
import type { OrderStatus } from "@/types/local-order";
import { formatBRL } from "@/lib/money";

function parseAmount(raw: string): number | null {
  const n = Number.parseFloat(raw.replace(",", "."));
  if (Number.isFinite(n) && n >= 0) return Math.round(n * 100) / 100;
  return null;
}

export default function AdminOrdersPage() {
  const orders = useLocalOrdersStore((s) => s.orders);
  const add = useLocalOrdersStore((s) => s.add);
  const updateStatus = useLocalOrdersStore((s) => s.updateStatus);
  const remove = useLocalOrdersStore((s) => s.remove);

  const [name, setName] = useState("");
  const [amountStr, setAmountStr] = useState("");
  const [status, setStatus] = useState<OrderStatus>("pending");

  const metrics = useMemo(() => selectLocalOrderMetrics(orders), [orders]);

  function submitManual(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseAmount(amountStr);
    if (!name.trim() || amount === null) return;
    add({ customerName: name.trim(), amount, status });
    setName("");
    setAmountStr("");
    setStatus("pending");
  }

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#F59E0B]">Operações</p>
          <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">Pedidos</h1>
          <p className="mt-2 max-w-xl text-sm text-zinc-500">
            Registe pedidos manualmente para acompanhar métricas neste painel.
          </p>
        </div>
        <Link
          href="/admin"
          className="text-sm font-medium text-zinc-500 underline-offset-4 transition-colors hover:text-[#F59E0B]"
        >
          ← Voltar ao painel
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-[#2a2a2a] bg-[#0f0f0f] p-4 sm:p-6"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Receita (pagos)</p>
          <p className="mt-2 text-2xl font-bold text-white">{formatBRL(metrics.revenuePaid)}</p>
        </motion.div>
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#0f0f0f] p-4 sm:p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Pendentes</p>
          <p className="mt-2 text-2xl font-bold text-amber-100/90">{metrics.pendingCount}</p>
          <p className="mt-1 text-xs text-zinc-500">{formatBRL(metrics.totalPending)}</p>
        </div>
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#0f0f0f] p-4 sm:p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Pagos</p>
          <p className="mt-2 text-2xl font-bold text-[#F59E0B]">{metrics.paidCount}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        <form
          onSubmit={submitManual}
          className="space-y-4 rounded-2xl border border-[#2a2a2a] bg-[#0f0f0f] p-4 sm:p-6"
        >
          <h2 className="font-heading text-lg font-bold">Novo pedido manual</h2>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500" htmlFor="cust">
              Cliente
            </label>
            <input
              id="cust"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full rounded-xl border border-[#2a2a2a] bg-[#111] px-4 py-3 text-sm outline-none ring-0 focus:border-[#F59E0B]/50"
              placeholder="Nome"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500" htmlFor="amt">
              Valor (R$)
            </label>
            <input
              id="amt"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              className="mt-2 w-full rounded-xl border border-[#2a2a2a] bg-[#111] px-4 py-3 text-sm outline-none focus:border-[#F59E0B]/50"
              placeholder="199,90"
              inputMode="decimal"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500" htmlFor="st">
              Status
            </label>
            <select
              id="st"
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
              className="mt-2 w-full rounded-xl border border-[#2a2a2a] bg-[#111] px-4 py-3 text-sm outline-none focus:border-[#F59E0B]/50"
            >
              <option value="pending">Pendente</option>
              <option value="paid">Pago</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-[#F59E0B] py-3 text-sm font-bold text-black transition-opacity hover:opacity-90"
          >
            Adicionar pedido
          </button>
        </form>

        <div className="overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[#0f0f0f]">
          <div className="border-b border-[#2a2a2a] px-4 py-3 sm:px-6 sm:py-4">
            <h2 className="font-heading text-base font-bold sm:text-lg">Lista ({orders.length})</h2>
          </div>
          <div className="max-h-[min(60vh,520px)] overflow-auto md:max-h-[480px]">
            <ul className="divide-y divide-[#2a2a2a] md:hidden">
              {orders.map((o) => (
                <li key={o.id} className="space-y-3 px-4 py-4">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-zinc-200">{o.customerName}</span>
                    <span className="font-semibold text-[#F59E0B]">{formatBRL(o.amount)}</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value as OrderStatus)}
                      className="min-h-[44px] min-w-[140px] rounded-xl border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-2 text-xs font-semibold uppercase"
                    >
                      <option value="pending">Pendente</option>
                      <option value="paid">Pago</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => remove(o.id)}
                      className="min-h-[44px] rounded-xl px-3 text-xs font-semibold text-red-400/90 hover:bg-red-500/10 hover:text-red-300"
                    >
                      Remover
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <table className="hidden w-full text-left text-sm md:table">
              <thead className="sticky top-0 bg-[#111] text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Valor</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a2a]">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-zinc-300">{o.customerName}</td>
                    <td className="px-4 py-3 font-medium text-[#F59E0B]">{formatBRL(o.amount)}</td>
                    <td className="px-4 py-3">
                      <select
                        value={o.status}
                        onChange={(e) => updateStatus(o.id, e.target.value as OrderStatus)}
                        className="rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-2 py-1 text-xs font-semibold uppercase"
                      >
                        <option value="pending">Pendente</option>
                        <option value="paid">Pago</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => remove(o.id)}
                        className="text-xs font-semibold text-red-400/90 hover:text-red-300"
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && (
              <p className="p-8 text-center text-sm text-zinc-500">Nenhum pedido ainda.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
