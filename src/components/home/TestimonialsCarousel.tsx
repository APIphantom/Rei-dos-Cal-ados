"use client";

import { useMemo } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { Package, Quote, UserRound } from "lucide-react";
import { Container } from "@/components/ui/container";
import { useTestimonialsLocalStore } from "@/features/storefront/testimonials-local-store";

export function TestimonialsCarousel() {
  const rawItems = useTestimonialsLocalStore((s) => s.items);
  const items = useMemo(
    () => [...rawItems].sort((a, b) => a.displayOrder - b.displayOrder),
    [rawItems]
  );
  const [emblaRef] = useEmblaCarousel({ align: "start", loop: items.length > 1, slidesToScroll: 1, containScroll: "trimSnaps" });

  if (items.length === 0) {
    return (
      <section id="depoimentos" className="border-b border-border/40 py-12 md:py-16">
        <Container>
          <p className="text-sm text-muted-foreground">
            Nenhum depoimento no momento. Adicione em <span className="text-foreground">Admin → Configurações</span>.
          </p>
        </Container>
      </section>
    );
  }

  return (
    <section id="depoimentos" className="border-b border-border/40 py-12 md:py-16">
      <Container>
        <div className="mb-10 max-w-lg">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">Depoimentos</p>
          <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground md:text-[1.65rem]">
            Quem compra, recomenda
          </h2>
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4">
            {items.map((t) => (
              <div
                key={t.id}
                className="min-w-[min(100%,320px)] shrink-0 rounded-2xl border border-border/40 bg-card/[0.35] p-4 shadow-lg transition-all duration-300 hover:border-primary/25 hover:shadow-xl md:min-w-[360px] md:p-5"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border/30 bg-muted/20">
                  {t.productImageUrl ? (
                    <Image
                      src={t.productImageUrl}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 90vw, 360px"
                      className="object-cover"
                      unoptimized={t.productImageUrl.startsWith("data:")}
                    />
                  ) : (
                    <div className="flex h-full min-h-[140px] w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                      <Package className="h-10 w-10 opacity-40" aria-hidden />
                      <span className="text-xs">Produto</span>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <Quote className="mb-2 h-4 w-4 text-primary/45" aria-hidden />
                  <p className="text-sm leading-relaxed text-muted-foreground">“{t.body}”</p>

                  <div className="mt-5 flex items-center gap-3 border-t border-border/30 pt-4">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-primary/25 bg-muted/30 ring-2 ring-primary/10">
                      {t.imageUrl ? (
                        <Image
                          src={t.imageUrl}
                          alt=""
                          fill
                          sizes="48px"
                          className="object-cover"
                          unoptimized={t.imageUrl.startsWith("data:")}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <UserRound className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-bold tracking-wide text-primary">{t.authorName}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
