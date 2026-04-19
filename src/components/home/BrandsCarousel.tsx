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

const navBtnClass =
  "grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border/50 text-muted-foreground transition-all duration-300 hover:border-primary/40 hover:bg-primary/10 hover:text-primary md:h-10 md:w-10";

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
            <div className="flex items-center gap-2 md:gap-3">
              <button type="button" onClick={scrollPrev} className={navBtnClass} aria-label="Marcas anteriores">
                <ChevronLeft className="h-4 w-4 md:h-[18px] md:w-[18px]" strokeWidth={1.75} />
              </button>

              <div className="min-w-0 flex-1 overflow-hidden" ref={emblaRef}>
                <div className="flex gap-2 md:gap-3">
                  {brands.map((b) => (
                    <div
                      key={b.name}
                      className="min-w-[min(148px,38vw)] shrink-0 sm:min-w-[160px]"
                    >
                      <Link
                        href={`/?brand=${encodeURIComponent(b.name)}#catalogo`}
                        aria-label={`Ver produtos ${b.name} no catálogo`}
                        className="group flex flex-col items-center gap-3 rounded-2xl px-2 py-4 transition-colors duration-300 hover:bg-primary/[0.06] sm:px-3 sm:py-5"
                      >
                        <BrandLogoImage brand={b} />
                        <span className="line-clamp-2 min-h-[2.5rem] text-center text-[10px] font-semibold uppercase leading-snug tracking-[0.06em] text-muted-foreground transition-colors duration-300 group-hover:text-primary sm:text-[11px] sm:tracking-[0.08em]">
                          {b.name}
                        </span>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              <button type="button" onClick={scrollNext} className={navBtnClass} aria-label="Próximas marcas">
                <ChevronRight className="h-4 w-4 md:h-[18px] md:w-[18px]" strokeWidth={1.75} />
              </button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
