"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Filter, Search, ShoppingBag, Trash2, X } from "lucide-react";
import { useLocalOrdersStore, selectLocalOrderMetrics } from "@/features/admin/local-orders-store";
import type { LocalOrder, OrderStatus } from "@/types/local-order";
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
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const metrics = useMemo(() => selectLocalOrderMetrics(orders), [orders]);
  const filteredOrders = useMemo(() => {
    const q = query.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesQuery =
        q.length === 0 ||
        order.customerName.toLowerCase().includes(q) ||
        order.id.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [orders, query, statusFilter]);

  const orderToDelete = useMemo(
    () => orders.find((order) => order.id === deleteId) ?? null,
    [deleteId, orders]
  );

  function submitManual(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseAmount(amountStr);

    if (!name.trim()) {
      setFormError("Informe o nome do cliente.");
      return;
    }

    if (amount === null) {
      setFormError("Informe um valor valido, por exemplo 199,90.");
      return;
    }

    setFormError(null);
    add({ customerName: name.trim(), amount, status });
    setName("");
    setAmountStr("");
    setStatus("pending");
    toast.success("Pedido manual adicionado.");
  }

  function handleStatusChange(order: LocalOrder, nextStatus: OrderStatus) {
    updateStatus(order.id, nextStatus);
    toast.success(nextStatus === "paid" ? "Pedido marcado como pago." : "Pedido marcado como pendente.");
  }

  function confirmRemove() {
    if (!orderToDelete) return;
    remove(orderToDelete.id);
    setDeleteId(null);
    toast.success("Pedido removido.");
  }

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#F59E0B]">Operações</p>
          <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">Pedidos</h1>
          <p className="mt-2 max-w-xl text-sm text-zinc-500">
            Registre pedidos manualmente, filtre a lista e acompanhe o resumo do painel sem se perder na tela.
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
          <p className="text-sm leading-relaxed text-zinc-500">
            Use este bloco para registrar vendas rápidas e alimentar os indicadores acima.
          </p>

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

          {formError && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/[0.06] px-3 py-2 text-sm text-red-200">
              {formError}
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-[#F59E0B] py-3 text-sm font-bold text-black transition-opacity hover:opacity-90"
          >
            Adicionar pedido
          </button>
        </form>

        <div className="overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[#0f0f0f]">
          <div className="border-b border-[#2a2a2a] px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-heading text-base font-bold sm:text-lg">Lista de pedidos</h2>
                <p className="mt-1 text-xs text-zinc-500">
                  {filteredOrders.length} de {orders.length} pedido(s) visiveis
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="relative min-w-0 sm:min-w-[220px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar por cliente ou ID"
                    className="h-11 w-full rounded-xl border border-[#2a2a2a] bg-[#111] py-2 pl-10 pr-4 text-sm text-white outline-none focus:border-[#F59E0B]/50"
                  />
                </label>

                <label className="relative min-w-0 sm:min-w-[170px]">
                  <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as "all" | OrderStatus)}
                    className="h-11 w-full appearance-none rounded-xl border border-[#2a2a2a] bg-[#111] py-2 pl-10 pr-4 text-sm text-white outline-none focus:border-[#F59E0B]/50"
                  >
                    <option value="all">Todos os status</option>
                    <option value="pending">Pendentes</option>
                    <option value="paid">Pagos</option>
                  </select>
                </label>
              </div>
            </div>
          </div>

          <div className="max-h-[min(60vh,520px)] overflow-auto md:max-h-[480px]">
            <ul className="divide-y divide-[#2a2a2a] md:hidden">
              {filteredOrders.map((o) => (
                <li key={o.id} className="space-y-3 px-4 py-4">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-zinc-200">{o.customerName}</span>
                    <span className="font-semibold text-[#F59E0B]">{formatBRL(o.amount)}</span>
                  </div>

                  <div className="text-xs text-zinc-500">{o.id.slice(0, 12)}…</div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <select
                      value={o.status}
                      onChange={(e) => handleStatusChange(o, e.target.value as OrderStatus)}
                      className="min-h-[44px] min-w-[140px] rounded-xl border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-2 text-xs font-semibold uppercase"
                    >
                      <option value="pending">Pendente</option>
                      <option value="paid">Pago</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => setDeleteId(o.id)}
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
                  <th className="px-4 py-3">Pedido</th>
                  <th className="px-4 py-3">Valor</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#2a2a2a]">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-zinc-300">{o.customerName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-500">{o.id.slice(0, 12)}…</td>
                    <td className="px-4 py-3 font-medium text-[#F59E0B]">{formatBRL(o.amount)}</td>
                    <td className="px-4 py-3">
                      <select
                        value={o.status}
                        onChange={(e) => handleStatusChange(o, e.target.value as OrderStatus)}
                        className="rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-2 py-1 text-xs font-semibold uppercase"
                      >
                        <option value="pending">Pendente</option>
                        <option value="paid">Pago</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setDeleteId(o.id)}
                        className="text-xs font-semibold text-red-400/90 hover:text-red-300"
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredOrders.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-3 p-8 text-center text-sm text-zinc-500">
                <ShoppingBag className="h-8 w-8 text-zinc-700" aria-hidden />
                <p>
                  {orders.length === 0
                    ? "Nenhum pedido ainda. Use o formulário ao lado para registrar o primeiro."
                    : "Nenhum pedido encontrado com os filtros atuais."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog.Root open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/80" />
          <Dialog.Content
            className="fixed left-1/2 top-1/2 z-[101] w-[min(92vw,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#2a2a2a] bg-[#0f0f0f] p-5 shadow-xl outline-none"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <Dialog.Title className="font-heading text-lg font-bold text-white">Remover pedido</Dialog.Title>
                <Dialog.Description className="mt-1 text-sm leading-relaxed text-zinc-500">
                  Esse registro sera removido do painel local deste navegador.
                </Dialog.Description>
              </div>
              <Dialog.Close
                type="button"
                className="grid h-9 w-9 place-items-center rounded-full border border-[#2a2a2a] text-zinc-400 hover:border-[#F59E0B]/50 hover:text-white"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </Dialog.Close>
            </div>

            {orderToDelete && (
              <div className="mt-5 rounded-xl border border-[#2a2a2a] bg-[#111] p-4">
                <p className="font-medium text-white">{orderToDelete.customerName}</p>
                <p className="mt-1 text-sm text-zinc-500">
                  {formatBRL(orderToDelete.amount)} · {orderToDelete.status === "paid" ? "Pago" : "Pendente"}
                </p>
              </div>
            )}

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <Dialog.Close
                type="button"
                className="h-11 rounded-full border border-[#2a2a2a] px-6 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:border-zinc-600"
              >
                Cancelar
              </Dialog.Close>
              <button
                type="button"
                onClick={confirmRemove}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-red-500 px-6 text-xs font-bold uppercase tracking-wider text-white"
              >
                <Trash2 className="h-4 w-4" />
                Confirmar remoção
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
