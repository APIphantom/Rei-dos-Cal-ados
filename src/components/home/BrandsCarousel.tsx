"use client";

import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback } from "react";
import { Container } from "@/components/ui/container";

export function BrandsCarousel({ brands }: { brands: string[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: brands.length > 3,
    dragFree: true,
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (brands.length === 0) return null;

  return (
    <section className="py-10 md:py-14">
      <Container>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="typo-label">Marcas</p>
            <h2 className="typo-h2 mt-2">Filtre por quem você confia</h2>
          </div>
          <div className="hidden gap-2 md:flex">
            <button
              type="button"
              onClick={scrollPrev}
              className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-card/40 transition-colors hover:border-primary/60"
              aria-label="Anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-card/40 transition-colors hover:border-primary/60"
              aria-label="Próximo"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="mt-6 overflow-hidden" ref={emblaRef}>
          <div className="flex gap-3">
            {brands.map((b) => (
              <div key={b} className="min-w-[min(200px,85vw)] shrink-0">
                <Link
                  href={`/?brand=${encodeURIComponent(b)}#catalogo`}
                  className="typo-btn flex h-14 items-center justify-center rounded-2xl border border-border bg-card/40 px-6 transition-all hover:scale-[1.02] hover:border-primary/60"
                >
                  {b}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
