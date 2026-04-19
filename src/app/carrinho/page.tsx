"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { formatBRL } from "@/lib/money";
import { useCartStore, useCartTotals } from "@/features/cart/store";

export default function CartPage() {
  const lines = useCartStore((s) => s.lines);
  const remove = useCartStore((s) => s.remove);
  const setQty = useCartStore((s) => s.setQty);
  const { total } = useCartTotals();

  return (
    <Section>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Carrinho
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
              Revise seus itens
            </h1>
          </div>
          <Link
            href="/#catalogo"
            className="text-xs font-bold uppercase tracking-[0.2em] text-primary hover:opacity-90"
          >
            Continuar comprando
          </Link>
        </div>

        {lines.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card p-10 text-center">
            <p className="text-sm text-muted-foreground">Seu carrinho está vazio.</p>
            <Link
              href="/#catalogo"
              className="mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground"
            >
              Ver catálogo
            </Link>
          </div>
        ) : (
          <div className="grid min-w-0 gap-8 lg:grid-cols-[1fr_420px]">
            <div className="min-w-0 space-y-4">
              {lines.map((line) => (
                <div
                  key={`${line.product.id}-${line.size}-${line.color}`}
                  className="flex gap-4 rounded-3xl border border-border bg-card p-5"
                >
                  <div className="relative h-28 w-24 overflow-hidden rounded-2xl bg-secondary">
                    <Image
                      src={line.product.images[0] ?? line.product.imageUrl}
                      alt={line.product.name}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                      {line.product.brand}
                    </p>
                    <p className="truncate text-sm font-medium">{line.product.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {line.size} · {line.color}
                    </p>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setQty(line.product.id, line.size, line.color, line.quantity - 1)
                          }
                          className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-background/40 hover:border-primary/60"
                          aria-label="Diminuir quantidade"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">
                          {line.quantity}
                        </span>
                        <button
                          onClick={() =>
                            setQty(line.product.id, line.size, line.color, line.quantity + 1)
                          }
                          className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-background/40 hover:border-primary/60"
                          aria-label="Aumentar quantidade"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-bold text-primary">
                          {formatBRL(line.product.price * line.quantity)}
                        </p>
                        <button
                          onClick={() => remove(line.product.id, line.size, line.color)}
                          className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/40 px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground hover:border-primary/60 hover:text-primary"
                        >
                          <Trash2 className="h-4 w-4" />
                          Remover
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="h-fit min-w-0 rounded-3xl border border-border bg-card p-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Resumo
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-xl font-bold text-primary">{formatBRL(total)}</span>
              </div>
              <Link
                href="/checkout"
                className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary px-8 text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground"
              >
                Ir para checkout
              </Link>
              <p className="mt-3 text-xs text-muted-foreground">
                Frete e prazo calculados no atendimento.
              </p>
            </aside>
          </div>
        )}
      </div>
    </Section>
  );
}

