"use client";

import Link from "next/link";
import { Package, Plus, ShoppingBag, Wallet } from "lucide-react";
import { useLocalOrdersStore, selectLocalOrderMetrics } from "@/features/admin/local-orders-store";
import { formatBRL } from "@/lib/money";

type Props = {
  displayName: string;
  email: string | null;
  productCount: number;
};

export function AdminDashboardClient({ displayName, email, productCount }: Props) {
  const orders = useLocalOrdersStore((s) => s.orders);
  const recent = orders.slice(0, 8);
  const m = selectLocalOrderMetrics(orders);

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#F59E0B]">Painel</p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight md:text-4xl">Visão geral</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Olá, {displayName}. Os pedidos abaixo são de demonstração (armazenados no navegador).
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/products/new"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#F59E0B] px-6 text-sm font-bold text-black transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Novo produto
          </Link>
          <Link
            href="/admin/orders"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#2a2a2a] px-6 text-sm font-semibold text-zinc-200 transition-colors hover:border-[#F59E0B]/50"
          >
            <ShoppingBag className="h-4 w-4" />
            Pedidos (local)
          </Link>
          <Link
            href="/admin/products"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#2a2a2a] px-6 text-sm font-semibold text-zinc-200 transition-colors hover:border-[#F59E0B]/50"
          >
            <Package className="h-4 w-4" />
            Produtos
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#0f0f0f] p-6 transition-transform hover:border-[#F59E0B]/30">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Produtos (catálogo)</p>
          <p className="mt-3 text-3xl font-bold text-[#F59E0B]">{productCount}</p>
        </div>
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#0f0f0f] p-6 transition-transform hover:border-[#F59E0B]/30">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Faturamento (pago)</p>
          <p className="mt-3 text-xl font-bold text-white">{formatBRL(m.revenuePaid)}</p>
          <p className="mt-1 text-xs text-zinc-500">{m.paidCount} pedido(s) pago(s)</p>
        </div>
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#0f0f0f] p-6 transition-transform hover:border-[#F59E0B]/30">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Pendentes</p>
          <p className="mt-3 text-3xl font-bold text-amber-100/90">{m.pendingCount}</p>
          <p className="mt-1 text-xs text-zinc-500">Valor: {formatBRL(m.totalPending)}</p>
        </div>
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#0f0f0f] p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Conta</p>
          <p className="mt-3 truncate text-sm font-semibold text-white">{email ?? "—"}</p>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-dashed border-[#2a2a2a] bg-[#0a0a0a] px-4 py-3 text-sm text-zinc-500">
        <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-[#F59E0B]" />
        <p>
          O faturamento considera apenas pedidos com status <strong className="text-zinc-300">pago</strong>. Pedidos em
          aberto aparecem em &quot;Pendentes&quot; e não entram no total de receita.
        </p>
      </div>

      <div className="rounded-2xl border border-[#2a2a2a] bg-[#0f0f0f] p-6">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-[#F59E0B]" />
          <h2 className="font-heading text-lg font-bold">Pedidos recentes (local)</h2>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500">
              <tr>
                <th className="py-3 pr-4">Pedido</th>
                <th className="py-3 pr-4">Cliente</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a]">
              {recent.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-zinc-500">
                    Nenhum pedido local. Crie em{" "}
                    <Link href="/admin/orders" className="font-semibold text-[#F59E0B] hover:underline">
                      Pedidos
                    </Link>
                    .
                  </td>
                </tr>
              ) : (
                recent.map((o) => (
                  <tr key={o.id} className="hover:bg-white/[0.02]">
                    <td className="py-4 font-mono text-xs text-zinc-400">{o.id.slice(0, 10)}…</td>
                    <td className="py-4 text-zinc-300">{o.customerName}</td>
                    <td className="py-4">
                      <span className="rounded-full border border-[#2a2a2a] bg-[#111] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-zinc-300">
                        {o.status === "paid" ? "pago" : "pendente"}
                      </span>
                    </td>
                    <td className="py-4 text-right font-semibold text-[#F59E0B]">{formatBRL(o.amount)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
