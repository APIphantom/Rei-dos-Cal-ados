"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useFormState } from "react-dom";
import { createProduct, deleteProduct } from "@/features/admin/products/actions";

type ActionState = { ok: boolean; error?: string; id?: string } | null;

type Row = {
  id: string;
  brand: string;
  name: string;
  category: string;
  price: number;
};

export default function AdminProductsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [pending, startTransition] = useTransition();
  const [state, formAction] = useFormState<ActionState>(
    createProduct as never,
    null
  );

  useEffect(() => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((d) => setRows(d.products ?? []))
      .catch(() => setRows([]));
  }, [state?.ok]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Admin</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Produtos</h1>
          <p className="mt-3 text-sm text-muted-foreground">Adicione, edite e remova produtos no Supabase.</p>
        </div>
        <Link
          href="/admin"
          className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-background/40 px-8 text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:border-primary/60"
        >
          Voltar
        </Link>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[440px_1fr]">
        <div className="rounded-3xl border border-border bg-card p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Novo produto</p>
          <form action={formAction} className="mt-5 space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Marca
              </label>
              <input
                name="brand"
                required
                className="h-12 w-full rounded-xl border border-border bg-background/40 px-4 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Nome
              </label>
              <input
                name="name"
                required
                className="h-12 w-full rounded-xl border border-border bg-background/40 px-4 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                URL da imagem principal
              </label>
              <input
                name="image_url"
                required
                type="url"
                placeholder="https://..."
                className="h-12 w-full rounded-xl border border-border bg-background/40 px-4 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Galeria (URLs separadas por vírgula, opcional)
              </label>
              <input
                name="gallery_urls"
                className="h-12 w-full rounded-xl border border-border bg-background/40 px-4 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Categoria
              </label>
              <input
                name="category"
                required
                placeholder="Tênis, Sandálias..."
                className="h-12 w-full rounded-xl border border-border bg-background/40 px-4 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  Preço
                </label>
                <input
                  name="price"
                  required
                  inputMode="decimal"
                  className="h-12 w-full rounded-xl border border-border bg-background/40 px-4 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Tamanhos (ex: 38,39,40,41)
              </label>
              <input
                name="sizes"
                placeholder="38,39,40"
                className="h-12 w-full rounded-xl border border-border bg-background/40 px-4 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Cores (Nome|#hex, separadas por vírgula)
              </label>
              <input
                name="colors"
                placeholder="Preto|#111111, Branco|#F5F5F5"
                className="h-12 w-full rounded-xl border border-border bg-background/40 px-4 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Descrição
              </label>
              <textarea
                name="description"
                required
                rows={4}
                className="w-full rounded-xl border border-border bg-background/40 px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-xs font-medium">
                <input name="is_featured" type="checkbox" className="rounded border-border" />
                Destaque na home
              </label>
              <label className="flex items-center gap-2 text-xs font-medium">
                <input name="is_bestseller" type="checkbox" className="rounded border-border" />
                Mais vendido
              </label>
            </div>

            {!state?.ok && state?.error && <p className="text-sm text-destructive">{state.error}</p>}

            <button
              type="submit"
              disabled={pending}
              className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary px-8 text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground disabled:opacity-50"
            >
              {pending ? "Salvando..." : "Adicionar produto"}
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Lista</p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                <tr>
                  <th className="py-3">Marca</th>
                  <th className="py-3">Nome</th>
                  <th className="py-3">Categoria</th>
                  <th className="py-3 text-right">Preço</th>
                  <th className="py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="py-4 font-medium">{r.brand}</td>
                    <td className="py-4 text-muted-foreground">{r.name}</td>
                    <td className="py-4 text-muted-foreground">{r.category}</td>
                    <td className="py-4 text-right font-bold text-primary">
                      R$ {r.price.toFixed(2).replace(".", ",")}
                    </td>
                    <td className="py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/produtos/${r.id}`}
                          className="inline-flex h-9 items-center justify-center rounded-xl border border-border bg-background/40 px-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors hover:border-primary/60"
                        >
                          Editar
                        </Link>
                        <button
                          type="button"
                          onClick={() =>
                            startTransition(async () => {
                              await deleteProduct(r.id);
                              setRows((prev) => prev.filter((x) => x.id !== r.id));
                            })
                          }
                          className="inline-flex h-9 items-center justify-center rounded-xl border border-border bg-background/40 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td className="py-8 text-sm text-muted-foreground" colSpan={5}>
                      Nenhum produto encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
