"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { formatBRL } from "@/lib/money";
import { cn } from "@/lib/utils";
import { useCartStore, useCartTotals } from "@/features/cart/store";

export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const setOpen = useCartStore((s) => s.setOpen);
  const lines = useCartStore((s) => s.lines);
  const remove = useCartStore((s) => s.remove);
  const setQty = useCartStore((s) => s.setQty);
  const { itemCount, total } = useCartTotals();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.25 }}
            className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-card"
            aria-label="Carrinho"
          >
            <div className="flex items-center justify-between border-b border-border p-6">
              <p className="text-sm font-bold uppercase tracking-[0.2em]">
                Carrinho ({itemCount})
              </p>
              <button
                className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-background/40"
                onClick={() => setOpen(false)}
                aria-label="Fechar carrinho"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
                <ShoppingBag className="h-12 w-12" />
                <p className="text-sm">Seu carrinho está vazio</p>
                <button
                  className="mt-2 rounded-xl border border-border bg-background/40 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-foreground hover:border-primary/60"
                  onClick={() => setOpen(false)}
                >
                  Continuar comprando
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-5 overflow-y-auto p-6">
                  {lines.map((line) => (
                    <div
                      key={`${line.product.id}-${line.size}-${line.color}`}
                      className="flex gap-4"
                    >
                      <div className="relative h-24 w-20 overflow-hidden rounded-lg bg-secondary">
                        <Image
                          src={line.product.images[0] ?? line.product.imageUrl}
                          alt={line.product.name}
                          fill
                          sizes="80px"
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

                        <div className="mt-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                setQty(line.product.id, line.size, line.color, line.quantity - 1)
                              }
                              className={cn(
                                "grid h-8 w-8 place-items-center rounded-lg border border-border bg-background/40 transition-colors hover:border-foreground/60"
                              )}
                              aria-label="Diminuir quantidade"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-6 text-center text-sm font-medium">
                              {line.quantity}
                            </span>
                            <button
                              onClick={() =>
                                setQty(line.product.id, line.size, line.color, line.quantity + 1)
                              }
                              className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-background/40 transition-colors hover:border-foreground/60"
                              aria-label="Aumentar quantidade"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-primary">
                              {formatBRL(line.product.price * line.quantity)}
                            </span>
                            <button
                              onClick={() => remove(line.product.id, line.size, line.color)}
                              className="text-muted-foreground transition-colors hover:text-primary"
                              aria-label="Remover item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 border-t border-border p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                      Total
                    </span>
                    <span className="text-lg font-bold text-primary">{formatBRL(total)}</span>
                  </div>

                  <div className="grid gap-2">
                    <Link
                      href="/checkout"
                      onClick={() => setOpen(false)}
                      className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-6 text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-[hsl(var(--primary))]/90"
                    >
                      Finalizar compra
                    </Link>
                    <Link
                      href="/carrinho"
                      onClick={() => setOpen(false)}
                      className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-background/40 px-6 text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:border-primary/60"
                    >
                      Ver carrinho
                    </Link>
                  </div>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

