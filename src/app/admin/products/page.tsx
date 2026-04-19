"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Search } from "lucide-react";
import { deleteProduct } from "@/features/admin/products/actions";
import { STORE_BRAND_NAMES, brandsMatch } from "@/config/store-brands";
import { formatBRL } from "@/lib/money";

type Row = {
  id: string;
  brand: string;
  name: string;
  category: string;
  price: number;
  image_url: string;
};

export default function AdminProductsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((d) => setRows(d.products ?? []))
      .catch(() => setRows([]));
  }, []);

  const filtered = useMemo(() => {
    let list = rows;
    const ql = q.trim().toLowerCase();
    if (ql) {
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(ql) ||
          r.brand.toLowerCase().includes(ql) ||
          r.category.toLowerCase().includes(ql)
      );
    }
    if (brandFilter) list = list.filter((r) => brandsMatch(r.brand, brandFilter));
    return list;
  }, [rows, q, brandFilter]);

  function onDelete(id: string) {
    if (!confirm("Excluir este produto?")) return;
    startTransition(async () => {
      try {
        await deleteProduct(id);
        setRows((prev) => prev.filter((x) => x.id !== id));
        toast.success("Produto removido.");
      } catch {
        toast.error("Não foi possível excluir.");
      }
    });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#F59E0B]">Catálogo</p>
          <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">Produtos</h1>
          <p className="mt-2 text-sm text-zinc-500">Pesquise, filtre por marca e edite itens.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex h-12 min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#F59E0B] px-6 text-sm font-bold text-black transition-opacity hover:opacity-90 md:w-auto"
        >
          <Plus className="h-4 w-4" />
          Novo produto
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nome, marca ou tipo…"
            className="h-12 w-full rounded-xl border border-[#2a2a2a] bg-[#111] py-2 pl-10 pr-4 text-sm text-white outline-none focus:border-[#F59E0B]"
          />
        </div>
        <label className="flex shrink-0 items-center gap-2 sm:w-56">
          <span className="sr-only">Marca</span>
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="h-12 w-full rounded-xl border border-[#2a2a2a] bg-[#111] px-3 text-sm text-white outline-none focus:border-[#F59E0B]"
          >
            <option value="">Todas as marcas</option>
            {STORE_BRAND_NAMES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="space-y-3 md:hidden">
        {filtered.map((r) => (
          <div
            key={r.id}
            className="flex gap-4 rounded-2xl border border-[#2a2a2a] bg-[#0f0f0f] p-4"
          >
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#111]">
              <Image src={r.image_url} alt="" fill className="object-cover" sizes="80px" loading="lazy" />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <p className="font-semibold leading-snug text-white">{r.name}</p>
              <p className="text-xs text-zinc-500">
                {r.brand} · {r.category}
              </p>
              <p className="text-sm font-bold text-[#F59E0B]">{formatBRL(Number(r.price))}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Link
                  href={`/admin/products/edit/${r.id}`}
                  className="inline-flex min-h-[40px] flex-1 items-center justify-center rounded-lg border border-[#2a2a2a] px-3 text-xs font-bold uppercase tracking-wider text-zinc-300 sm:flex-none"
                >
                  Editar
                </Link>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => onDelete(r.id)}
                  className="inline-flex min-h-[40px] flex-1 items-center justify-center rounded-lg border border-[#2a2a2a] px-3 text-xs font-bold uppercase tracking-wider text-zinc-500 sm:flex-none hover:border-red-500/50 hover:text-red-400 disabled:opacity-50"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="rounded-2xl border border-dashed border-[#2a2a2a] py-12 text-center text-sm text-zinc-500">
            Nenhum produto encontrado.
          </p>
        )}
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[#0f0f0f] md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-[#2a2a2a] text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500">
              <tr>
                <th className="py-4 pl-4">Imagem</th>
                <th className="py-4">Nome</th>
                <th className="py-4">Preço</th>
                <th className="py-4">Marca</th>
                <th className="py-4">Tipo</th>
                <th className="py-4 pr-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a]">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-white/[0.02]">
                  <td className="py-3 pl-4">
                    <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#111]">
                      <Image
                        src={r.image_url}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="56px"
                        loading="lazy"
                      />
                    </div>
                  </td>
                  <td className="max-w-[200px] py-3 font-medium text-white">{r.name}</td>
                  <td className="py-3 font-semibold text-[#F59E0B]">{formatBRL(Number(r.price))}</td>
                  <td className="py-3 text-zinc-400">{r.brand}</td>
                  <td className="py-3 text-zinc-400">{r.category}</td>
                  <td className="py-3 pr-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/products/edit/${r.id}`}
                        className="rounded-lg border border-[#2a2a2a] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-zinc-300 transition-colors hover:border-[#F59E0B]/50"
                      >
                        Editar
                      </Link>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => onDelete(r.id)}
                        className="rounded-lg border border-[#2a2a2a] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500 transition-colors hover:border-red-500/50 hover:text-red-400 disabled:opacity-50"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    Nenhum produto nesta vista.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
