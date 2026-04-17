"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Product } from "@/types/product";
import { ProductCard } from "./ProductCard";

type Sort = "best" | "lowest";

function unique<T>(arr: T[]) {
  return Array.from(new Set(arr));
}

export function CatalogSection({ products }: { products: Product[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const brand = sp.get("brand") ?? "";
  const category = sp.get("cat") ?? "";
  const size = sp.get("size") ?? "";
  const color = sp.get("color") ?? "";
  const sort = (sp.get("sort") as Sort) ?? "best";

  const brands = useMemo(() => unique(products.map((p) => p.brand)).sort((a, b) => a.localeCompare(b, "pt-BR")), [products]);
  const categories = useMemo(
    () => unique(products.map((p) => p.category)).sort((a, b) => a.localeCompare(b, "pt-BR")),
    [products]
  );
  const sizes = useMemo(
    () => unique(products.flatMap((p) => p.sizes)).sort((a, b) => Number(a) - Number(b)),
    [products]
  );
  const colors = useMemo(
    () => unique(products.flatMap((p) => p.colors.map((c) => c.name))).sort(),
    [products]
  );

  const filtered = useMemo(() => {
    let list = products.slice();
    if (brand) list = list.filter((p) => p.brand === brand);
    if (category) list = list.filter((p) => p.category === category);
    if (size) list = list.filter((p) => p.sizes.includes(size));
    if (color) list = list.filter((p) => p.colors.some((c) => c.name === color));
    if (sort === "best") {
      list = list.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));
    }
    if (sort === "lowest") list = list.sort((a, b) => a.price - b.price);
    return list;
  }, [products, brand, category, size, color, sort]);

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(sp.toString());
    if (!value) next.delete(key);
    else next.set(key, value);
    router.push(`${pathname}?${next.toString()}`);
  }

  function clear() {
    router.push(pathname);
  }

  return (
    <div id="catalogo" className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="typo-label">Catálogo</p>
          <h2 className="typo-h2 mt-2">Encontre o seu próximo par</h2>
          <p className="typo-small mt-3 max-w-2xl">
            Filtre por categoria, tamanho, cor e marca. Ordene por destaque ou menor preço.
          </p>
        </div>

        <button
          type="button"
          onClick={clear}
          className="typo-btn h-11 w-full rounded-xl border border-border bg-card/40 px-4 transition-colors hover:border-primary/60 md:w-auto"
        >
          Limpar filtros
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
        <label className="space-y-2">
          <span className="typo-label">
            Categoria
          </span>
          <select
            className="font-body h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground"
            value={category}
            onChange={(e) => setParam("cat", e.target.value)}
          >
            <option value="">Todas</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="typo-label">
            Marca
          </span>
          <select
            className="font-body h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground"
            value={brand}
            onChange={(e) => setParam("brand", e.target.value)}
          >
            <option value="">Todas</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="typo-label">
            Tamanho
          </span>
          <select
            className="font-body h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground"
            value={size}
            onChange={(e) => setParam("size", e.target.value)}
          >
            <option value="">Todos</option>
            {sizes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="typo-label">
            Cor
          </span>
          <select
            className="font-body h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground"
            value={color}
            onChange={(e) => setParam("color", e.target.value)}
          >
            <option value="">Todas</option>
            {colors.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="typo-label">
            Ordenar
          </span>
          <select
            className="font-body h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground"
            value={sort}
            onChange={(e) => setParam("sort", e.target.value)}
          >
            <option value="best">Destaques</option>
            <option value="lowest">Menor preço</option>
          </select>
        </label>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card/40 p-10 text-center text-sm text-muted-foreground">
          Nenhum produto com esses filtros.{" "}
          <button type="button" onClick={clear} className="text-primary underline underline-offset-4">
            Limpar filtros
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((p, idx) => (
            <ProductCard key={p.id} product={p} index={idx} />
          ))}
        </div>
      )}
    </div>
  );
}
