import Link from "next/link";
import { Container } from "@/components/ui/container";

export function HomeHero() {
  return (
    <section className="relative min-h-[min(72vh,560px)] border-b border-border/40 md:min-h-[min(78vh,640px)]">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_-20%,hsl(38_92%_50%_/_0.14),transparent_55%)]"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background via-background/98 to-background" aria-hidden />

      <Container className="relative flex min-h-[min(72vh,560px)] flex-col justify-end pb-14 pt-28 md:min-h-[min(78vh,640px)] md:pb-20 md:pt-32">
        <div className="max-w-xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">Rei Dos Calçados</p>
          <h1 className="mt-3 font-heading text-[2.25rem] font-bold leading-[1.08] tracking-tight text-foreground md:text-[2.75rem] lg:text-[3.25rem]">
            Estilo começa pelos pés
          </h1>
          <p className="mt-4 text-sm text-muted-foreground md:text-base">Frete grátis · 6x sem juros</p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="#catalogo"
              className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-8 text-[11px] font-bold uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-90"
            >
              Ver coleção
            </Link>
            <Link
              href="#catalogo"
              className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground underline-offset-4 transition-colors hover:text-primary"
            >
              Ir ao catálogo
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
