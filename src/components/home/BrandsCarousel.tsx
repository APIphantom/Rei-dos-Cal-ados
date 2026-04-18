"use client";

import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback } from "react";
import type { StoreBrand } from "@/config/store-brands";
import { BrandLogoImage } from "@/components/home/BrandLogoImage";
import { Container } from "@/components/ui/container";

type Props = {
  brands: StoreBrand[];
};

export function BrandsCarousel({ brands }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: brands.length > 4,
    dragFree: true,
    containScroll: "trimSnaps",
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (brands.length === 0) return null;

  return (
    <section className="border-b border-border/40 py-12 md:py-16">
      <Container>
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between md:gap-12">
          <div className="max-w-sm shrink-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">Marcas</p>
            <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground md:text-[1.65rem]">
              Parceiros
            </h2>
          </div>

          <div className="relative min-w-0 flex-1">
            <div className="absolute -top-1 right-0 z-10 hidden gap-1 md:flex">
              <button
                type="button"
                onClick={scrollPrev}
                className="grid h-9 w-9 place-items-center rounded-full border border-border/50 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                aria-label="Anterior"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
              </button>
              <button
                type="button"
                onClick={scrollNext}
                className="grid h-9 w-9 place-items-center rounded-full border border-border/50 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                aria-label="Próximo"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>

            <div className="overflow-hidden pr-0 md:pr-24" ref={emblaRef}>
              <div className="flex gap-2 md:gap-3">
                {brands.map((b) => (
                  <div key={b.name} className="min-w-[min(118px,28vw)] shrink-0 sm:min-w-[128px]">
                    <Link
                      href={`/?brand=${encodeURIComponent(b.name)}#catalogo`}
                      aria-label={`Ver produtos ${b.name} no catálogo`}
                      className="group flex flex-col items-center gap-3 rounded-2xl px-3 py-5 transition-colors duration-300 hover:bg-primary/[0.06]"
                    >
                      <span className="relative flex h-[52px] w-full items-center justify-center">
                        <BrandLogoImage brand={b} />
                      </span>
                      <span className="text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground transition-colors duration-300 group-hover:text-primary">
                        {b.name}
                      </span>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
