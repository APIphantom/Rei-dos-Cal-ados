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
          <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">Visão geral</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Olá, {displayName}. Aqui vê um resumo da loja e pedidos recentes.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:gap-3">
          <Link
            href="/admin/products/new"
            className="inline-flex h-12 min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#F59E0B] px-6 text-sm font-bold text-black transition-opacity hover:opacity-90 sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Novo produto
          </Link>
          <Link
            href="/admin/orders"
            className="inline-flex h-12 min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-[#2a2a2a] px-6 text-sm font-semibold text-zinc-200 transition-colors hover:border-[#F59E0B]/50 sm:w-auto"
          >
            <ShoppingBag className="h-4 w-4" />
            Pedidos
          </Link>
          <Link
            href="/admin/products"
            className="inline-flex h-12 min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-[#2a2a2a] px-6 text-sm font-semibold text-zinc-200 transition-colors hover:border-[#F59E0B]/50 sm:w-auto"
          >
            <Package className="h-4 w-4" />
            Produtos
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#0f0f0f] p-4 transition-transform hover:border-[#F59E0B]/30 sm:p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Produtos (catálogo)</p>
          <p className="mt-2 text-2xl font-bold text-[#F59E0B] sm:mt-3 sm:text-3xl">{productCount}</p>
        </div>
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#0f0f0f] p-4 transition-transform hover:border-[#F59E0B]/30 sm:p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Faturamento (pago)</p>
          <p className="mt-2 text-lg font-bold text-white sm:mt-3 sm:text-xl">{formatBRL(m.revenuePaid)}</p>
          <p className="mt-1 text-[11px] text-zinc-500 sm:text-xs">{m.paidCount} pago(s)</p>
        </div>
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#0f0f0f] p-4 transition-transform hover:border-[#F59E0B]/30 sm:p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Pendentes</p>
          <p className="mt-2 text-2xl font-bold text-amber-100/90 sm:mt-3 sm:text-3xl">{m.pendingCount}</p>
          <p className="mt-1 text-[11px] text-zinc-500 sm:text-xs">{formatBRL(m.totalPending)}</p>
        </div>
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#0f0f0f] p-4 sm:p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Conta</p>
          <p className="mt-2 truncate text-xs font-semibold text-white sm:text-sm">{email ?? "—"}</p>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-dashed border-[#2a2a2a] bg-[#0a0a0a] px-3 py-3 text-xs text-zinc-500 sm:px-4 sm:text-sm">
        <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-[#F59E0B]" />
        <p>
          O faturamento considera apenas pedidos com status <strong className="text-zinc-300">pago</strong>. Pedidos em
          aberto aparecem em &quot;Pendentes&quot; e não entram no total de receita.
        </p>
      </div>

      <div className="rounded-2xl border border-[#2a2a2a] bg-[#0f0f0f] p-4 sm:p-6">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-[#F59E0B]" />
          <h2 className="font-heading text-base font-bold sm:text-lg">Pedidos recentes</h2>
        </div>

        <ul className="mt-4 space-y-3 md:hidden">
          {recent.length === 0 ? (
            <li className="rounded-xl border border-dashed border-[#2a2a2a] py-8 text-center text-sm text-zinc-500">
              Nenhum pedido.{" "}
              <Link href="/admin/orders" className="font-semibold text-[#F59E0B] hover:underline">
                Pedidos
              </Link>
            </li>
          ) : (
            recent.map((o) => (
              <li
                key={o.id}
                className="flex flex-col gap-2 rounded-xl border border-[#2a2a2a] bg-[#111] px-4 py-3 text-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-medium text-zinc-200">{o.customerName}</span>
                  <span className="font-semibold text-[#F59E0B]">{formatBRL(o.amount)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span className="font-mono">{o.id.slice(0, 10)}…</span>
                  <span className="rounded-full border border-[#2a2a2a] bg-[#0a0a0a] px-2 py-0.5 font-semibold uppercase tracking-wider text-zinc-300">
                    {o.status === "paid" ? "pago" : "pendente"}
                  </span>
                </div>
              </li>
            ))
          )}
        </ul>

        <div className="mt-4 hidden overflow-x-auto md:block">
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
