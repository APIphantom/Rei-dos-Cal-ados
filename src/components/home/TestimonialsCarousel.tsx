"use client";

import useEmblaCarousel from "embla-carousel-react";
import { Quote } from "lucide-react";
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
  const [emblaRef] = useEmblaCarousel({ align: "start", loop: true, slidesToScroll: 1 });

  return (
    <section id="depoimentos" className="py-14 md:py-20">
      <Container>
        <div className="mb-8">
          <p className="typo-label">Depoimentos</p>
          <h2 className="typo-h2 mt-2">Quem compra, recomenda</h2>
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="min-w-[min(100%,340px)] shrink-0 rounded-3xl border border-border bg-card/60 p-6 md:min-w-[380px]"
              >
                <Quote className="h-8 w-8 text-primary/80" />
                <p className="typo-small mt-4 leading-relaxed">“{t.text}”</p>
                <p className="typo-label mt-6 text-foreground">{t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
