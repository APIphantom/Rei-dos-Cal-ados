"use client";

import useEmblaCarousel from "embla-carousel-react";
import { Container } from "@/components/ui/container";
import type { Testimonial } from "@/types/testimonial";

type Props = {
  items: Testimonial[];
};

export function TestimonialsCarousel({ items }: Props) {
  const [emblaRef] = useEmblaCarousel({ align: "start", loop: items.length > 1, slidesToScroll: 1, containScroll: "trimSnaps" });

  if (items.length === 0) {
    return (
      <section id="depoimentos" className="border-b border-border/40 py-12 md:py-16">
        <Container>
          <p className="text-sm text-muted-foreground">Nenhum depoimento cadastrado ainda.</p>
        </Container>
      </section>
    );
  }

  return (
    <section id="depoimentos" className="border-b border-border/40 py-12 md:py-16">
      <Container>
        <div className="mb-8 max-w-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">Depoimentos</p>
          <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground md:text-[1.65rem]">
            Quem compra, recomenda
          </h2>
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-3">
            {items.map((t) => (
              <div
                key={t.id}
                className="min-w-[min(100%,300px)] shrink-0 rounded-2xl border border-border/40 bg-card/[0.35] px-5 py-6 md:min-w-[320px]"
              >
                <p className="text-sm leading-relaxed text-muted-foreground">“{t.body}”</p>
                <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">{t.authorName}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
