import { CreditCard, Truck } from "lucide-react";
import { Container } from "@/components/ui/container";

export function PromoStrip() {
  return (
    <div className="border-y border-primary/20 bg-gradient-to-r from-card/80 via-card to-card/80">
      <Container className="flex flex-wrap items-center justify-center gap-4 py-4 text-sm md:gap-8">
        <span className="typo-btn inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/30 px-4 py-2">
          <Truck className="h-4 w-4 text-primary" />
          Frete grátis
        </span>
        <span className="hidden h-4 w-px bg-border md:block" aria-hidden />
        <span className="typo-body text-center font-medium text-foreground/90 md:text-lg">
          Frete grátis • 6x sem juros
        </span>
        <span className="hidden h-4 w-px bg-border md:block" aria-hidden />
        <span className="typo-btn inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/30 px-4 py-2">
          <CreditCard className="h-4 w-4 text-primary" />
          Parcelamento
        </span>
      </Container>
    </div>
  );
}
