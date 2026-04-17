"use client";

import useEmblaCarousel from "embla-carousel-react";
import { Container } from "@/components/ui/container";

const testimonials = [
  {
    name: "Mariana S.",
    text: "Chegou rápido e o acabamento é impecável. O conforto surpreendeu.",
  },
  {
    name: "Rafael L.",
    text: "Atendimento no WhatsApp foi direto ao ponto. Comprei em 5 minutos.",
  },
  {
    name: "Camila A.",
    text: "Produto lindo, ficou perfeito. Compra segura e entrega no prazo.",
  },
  {
    name: "João P.",
    text: "Preço bom e qualidade acima do esperado. Já quero o próximo.",
  },
];

export function TestimonialsCarousel() {
  const [emblaRef] = useEmblaCarousel({ align: "start", loop: true, slidesToScroll: 1, containScroll: "trimSnaps" });

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
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="min-w-[min(100%,300px)] shrink-0 rounded-2xl border border-border/40 bg-card/[0.35] px-5 py-6 md:min-w-[320px]"
              >
                <p className="text-sm leading-relaxed text-muted-foreground">“{t.text}”</p>
                <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">{t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
