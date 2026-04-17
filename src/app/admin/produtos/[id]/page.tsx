"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { updateProduct } from "@/features/admin/products/actions";

type ActionState = { ok: boolean; error?: string } | null;

type ProductRow = {
  id: string;
  brand: string;
  name: string;
  category: string;
  description: string;
  price: number;
  image_url: string;
  gallery_urls: string[] | null;
  sizes: string[] | null;
  colors: string[] | null;
  is_featured: boolean | null;
  is_bestseller: boolean | null;
};

export default function AdminEditProductPage() {
  const params = useParams();
  const id = params.id as string;

  const [row, setRow] = useState<ProductRow | null>(null);
  const [state, formAction] = useFormState<ActionState>(
    updateProduct.bind(null, id) as never,
    null
  );

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/products/${id}`)
      .then((r) => r.json())
      .then((d) => setRow(d.product ?? null))
      .catch(() => setRow(null));
  }, [id]);

  const sizesStr = row?.sizes?.join(", ") ?? "";
  const colorsStr = row?.colors?.join(", ") ?? "";
  const galleryStr = row?.gallery_urls?.join(", ") ?? "";

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12">
      <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Admin</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Editar produto</h1>
          </div>
          <Link
            href="/admin/produtos"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-background/40 px-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors hover:border-primary/60"
          >
            Voltar
          </Link>
        </div>

        {!row ? (
          <div className="mt-6 h-[380px] animate-pulse rounded-2xl border border-border bg-background/30" />
        ) : (
          <form action={formAction} className="mt-7 space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Marca
              </label>
              <input
                name="brand"
                defaultValue={row.brand}
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
                defaultValue={row.name}
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
                defaultValue={row.image_url}
                required
                className="h-12 w-full rounded-xl border border-border bg-background/40 px-4 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Galeria (URLs, vírgula)
              </label>
              <input
                name="gallery_urls"
                defaultValue={galleryStr}
                className="h-12 w-full rounded-xl border border-border bg-background/40 px-4 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Categoria
              </label>
              <input
                name="category"
                defaultValue={row.category}
                required
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
                  defaultValue={String(row.price)}
                  required
                  inputMode="decimal"
                  className="h-12 w-full rounded-xl border border-border bg-background/40 px-4 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Tamanhos
              </label>
              <input
                name="sizes"
                defaultValue={sizesStr}
                className="h-12 w-full rounded-xl border border-border bg-background/40 px-4 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Cores (Nome|#hex)
              </label>
              <input
                name="colors"
                defaultValue={colorsStr}
                className="h-12 w-full rounded-xl border border-border bg-background/40 px-4 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Descrição
              </label>
              <textarea
                name="description"
                defaultValue={row.description}
                required
                rows={5}
                className="w-full rounded-xl border border-border bg-background/40 px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-xs font-medium">
                <input
                  name="is_featured"
                  type="checkbox"
                  defaultChecked={!!row.is_featured}
                  className="rounded border-border"
                />
                Destaque na home
              </label>
              <label className="flex items-center gap-2 text-xs font-medium">
                <input
                  name="is_bestseller"
                  type="checkbox"
                  defaultChecked={!!row.is_bestseller}
                  className="rounded border-border"
                />
                Mais vendido
              </label>
            </div>

            {!state?.ok && state?.error && <p className="text-sm text-destructive">{state.error}</p>}

            <button
              type="submit"
              className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary px-8 text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground disabled:opacity-50"
            >
              Salvar alterações
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
