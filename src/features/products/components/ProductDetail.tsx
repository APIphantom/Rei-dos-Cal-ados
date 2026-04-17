"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { MessageCircle, Package, ShoppingBag, Sparkles } from "lucide-react";
import type { Product } from "@/types/product";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { formatBRL } from "@/lib/money";
import { buildProductWhatsAppUrl } from "@/lib/whatsapp";
import { useCartStore } from "@/features/cart/store";
import { ProductCard } from "./ProductCard";

function mockStockUnits(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i)) % 19;
  return 4 + h;
}

export function ProductDetail({ product, related }: { product: Product; related: Product[] }) {
  const [activeImage, setActiveImage] = useState(product.images[0] ?? product.imageUrl);
  const [size, setSize] = useState(product.sizes[0] ?? "");
  const [color, setColor] = useState(product.colors[0]?.name ?? "");

  const add = useCartStore((s) => s.add);

  const whatsappUrl = useMemo(() => {
    if (!size || !color) return "";
    return buildProductWhatsAppUrl({ product, size, color });
  }, [product, size, color]);

  const stock = mockStockUnits(product.id);

  return (
    <>
      <Section className="pb-10">
        <Container>
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="space-y-4">
              <div className="group relative aspect-[4/5] overflow-hidden rounded-3xl border border-border bg-card">
                <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.08]">
                  <Image
                    src={activeImage}
                    alt={product.name}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent" />

                {product.isBestseller && (
                  <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-background">
                    <Sparkles className="h-3.5 w-3.5" />
                    Mais vendido
                  </div>
                )}
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img) => (
                  <button
                    key={img}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    className={[
                      "relative h-20 w-16 shrink-0 overflow-hidden rounded-2xl border bg-card transition-colors",
                      img === activeImage ? "border-primary ring-1 ring-primary/40" : "border-border hover:border-primary/50",
                    ].join(" ")}
                    aria-label="Selecionar imagem"
                  >
                    <Image src={img} alt="" fill sizes="64px" className="object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="typo-label">{product.brand}</p>
                <h1 className="typo-h2 mt-2">{product.name}</h1>
                {product.tags.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-2" aria-label="Etiquetas">
                    {product.tags.map((t) => (
                      <li
                        key={t}
                        className="rounded-full border border-border bg-card/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                      >
                        {t}
                      </li>
                    ))}
                  </ul>
                )}
                <p className="typo-body-muted mt-4">{product.description}</p>
              </div>

              <div className="flex flex-wrap items-baseline gap-3">
                <p className="typo-price-lg">{formatBRL(product.price)}</p>
                <span className="typo-label">Até 6x sem juros</span>
              </div>

              <div className="typo-small flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1.5">
                  <Package className="h-3.5 w-3.5 text-primary" />
                  Estoque: <strong className="text-foreground">{stock} un.</strong> (estimativa)
                </span>
              </div>

              <div className="space-y-5 rounded-3xl border border-border bg-card p-6">
                <div className="space-y-2">
                  <p className="typo-label">Tamanho</p>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSize(s)}
                        className={[
                          "typo-btn h-10 rounded-xl border px-4 transition-colors",
                          s === size
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background/40 hover:border-primary/60",
                        ].join(" ")}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="typo-label">Cor</p>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setColor(c.name)}
                        className={[
                          "typo-btn inline-flex h-10 items-center gap-2 rounded-xl border px-4 transition-colors",
                          c.name === color
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background/40 hover:border-primary/60",
                        ].join(" ")}
                      >
                        <span
                          className="h-3 w-3 rounded-full border border-border"
                          style={{ backgroundColor: c.hex }}
                        />
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => add(product, size, color)}
                    className="typo-btn inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-primary-foreground transition-transform active:scale-[0.98]"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Comprar agora
                  </button>

                  <a
                    href={whatsappUrl || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-disabled={!whatsappUrl}
                    className={[
                      "typo-btn inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-background/40 px-6 transition-colors",
                      whatsappUrl ? "hover:border-primary/60" : "pointer-events-none opacity-50",
                    ].join(" ")}
                  >
                    <MessageCircle className="h-4 w-4 text-primary" />
                    Falar no WhatsApp
                  </a>
                </div>

                {!whatsappUrl && (
                  <p className="text-xs text-muted-foreground">Selecione tamanho e cor para abrir o WhatsApp.</p>
                )}

                <p className="text-xs text-muted-foreground">
                  Ou volte para o{" "}
                  <Link href="/#catalogo" className="text-primary underline underline-offset-4">
                    catálogo
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section className="pt-0">
        <Container>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="typo-label">Mesma categoria</p>
              <h2 className="typo-h2 mt-2">Produtos relacionados</h2>
            </div>
            <Link
              href="/#catalogo"
              className="typo-btn hidden text-primary hover:opacity-90 md:inline"
            >
              Ver mais
            </Link>
          </div>

          {related.length === 0 ? (
            <p className="mt-8 text-sm text-muted-foreground">Sem outros itens nesta categoria por enquanto.</p>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p, idx) => (
                <ProductCard key={p.id} product={p} index={idx} />
              ))}
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}
