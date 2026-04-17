import Link from "next/link";
import { Package, Plus, ShoppingBag } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSessionWithProfile } from "@/lib/auth/server";
import { getOrderStats, getRecentOrders } from "@/lib/admin/dashboard";
import { formatBRL } from "@/lib/money";

export default async function AdminPage() {
  const { user, profile } = await getSessionWithProfile();
  const supabase = await createClient();
  const { count: productCount } = await supabase.from("products").select("*", { count: "exact", head: true });

  const { count: orderCount, revenue } = await getOrderStats();
  const recentOrders = await getRecentOrders(8);

  const displayName = profile?.full_name?.trim() || user?.email || "Admin";

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#F59E0B]">Painel</p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight md:text-4xl">Visão geral</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Olá, {displayName}. Gerencie produtos e acompanhe pedidos.
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
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Produtos</p>
          <p className="mt-3 text-3xl font-bold text-[#F59E0B]">{productCount ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#0f0f0f] p-6 transition-transform hover:border-[#F59E0B]/30">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Pedidos</p>
          <p className="mt-3 text-3xl font-bold text-[#F59E0B]">{orderCount}</p>
        </div>
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#0f0f0f] p-6 transition-transform hover:border-[#F59E0B]/30">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Receita (pedidos)</p>
          <p className="mt-3 text-xl font-bold text-white">{formatBRL(revenue)}</p>
        </div>
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#0f0f0f] p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Conta</p>
          <p className="mt-3 truncate text-sm font-semibold text-white">{user?.email}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-[#2a2a2a] bg-[#0f0f0f] p-6">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-[#F59E0B]" />
          <h2 className="font-heading text-lg font-bold">Pedidos recentes</h2>
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
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-zinc-500">
                    Nenhum pedido. Execute a migração com a tabela <code className="rounded bg-[#111] px-1">orders</code> ou
                    cadastre pedidos futuros.
                  </td>
                </tr>
              ) : (
                recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-white/[0.02]">
                    <td className="py-4 font-mono text-xs text-zinc-400">{o.id.slice(0, 8)}…</td>
                    <td className="py-4 text-zinc-300">{o.customer_name}</td>
                    <td className="py-4">
                      <span className="rounded-full border border-[#2a2a2a] bg-[#111] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-zinc-300">
                        {o.status}
                      </span>
                    </td>
                    <td className="py-4 text-right font-semibold text-[#F59E0B]">{formatBRL(o.total)}</td>
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
