"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Product } from "@/types/product";
import { STORE_BRAND_NAMES, brandsMatch } from "@/config/store-brands";
import { ProductCard } from "./ProductCard";

export function CatalogSection({ products }: { products: Product[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const selectedBrand = sp.get("brand") ?? "";

  const filtered = useMemo(() => {
    let list = products.slice();
    if (selectedBrand) {
      list = list.filter((p) => brandsMatch(p.brand, selectedBrand));
    }
    list = list.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));
    return list;
  }, [products, selectedBrand]);

  function setBrandFilter(value: string) {
    const next = new URLSearchParams(sp.toString());
    next.delete("cat");
    if (!value) next.delete("brand");
    else next.set("brand", value);
    router.push(`${pathname}?${next.toString()}#catalogo`);
  }

  function clearFilters() {
    router.push(`${pathname}#catalogo`);
  }

  return (
    <div id="catalogo" className="space-y-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">Catálogo</p>
          <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground md:text-[1.65rem]">
            Encontre o seu próximo par
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            {selectedBrand ? (
              <>
                Marca: <span className="text-primary">{selectedBrand}</span>. Troque abaixo ou limpe o filtro.
              </>
            ) : (
              <>Filtre por marca ou navegue pelo carrossel acima.</>
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={clearFilters}
          className="h-11 w-full shrink-0 rounded-full border border-border/60 bg-background/40 px-5 text-[11px] font-bold uppercase tracking-[0.18em] text-foreground transition-colors hover:border-primary/50 hover:bg-primary/10 md:w-auto"
        >
          Limpar filtros
        </button>
      </div>

      <div className="max-w-md">
        <label className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Marca</span>
          <select
            className="font-body h-11 w-full rounded-full border border-border/60 bg-card/[0.35] px-4 text-sm text-foreground"
            value={selectedBrand}
            onChange={(e) => setBrandFilter(e.target.value)}
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

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-border/40 bg-card/[0.2] p-10 text-center text-sm text-muted-foreground">
          Nenhum produto encontrado para essa marca.{" "}
          <button type="button" onClick={clearFilters} className="text-primary underline underline-offset-4">
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
