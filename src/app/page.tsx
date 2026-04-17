import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { BrandsCarousel } from "@/components/home/BrandsCarousel";
import { FeaturedProduct } from "@/components/home/FeaturedProduct";
import { PromoStrip } from "@/components/home/PromoStrip";
import { TestimonialsCarousel } from "@/components/home/TestimonialsCarousel";
import { CatalogSection } from "@/features/products/components/CatalogSection";
import { getAllProducts, getDistinctBrands, getFeaturedProduct } from "@/features/products/services/products";

export default async function HomePage() {
  const [products, featured, brands] = await Promise.all([
    getAllProducts(),
    getFeaturedProduct(),
    getDistinctBrands(),
  ]);

  return (
    <>
      <section className="relative min-h-[560px] md:min-h-[720px]">
        <Image
          src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=2400&q=80"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

        <Container className="relative flex min-h-[560px] items-end pb-16 md:min-h-[720px] md:pb-24">
          <div className="max-w-2xl">
            <p className="typo-overline">Rei Dos Calçados</p>
            <h1 className="typo-hero mt-3">Estilo começa pelos pés</h1>
            <p className="typo-body-muted mt-4 md:text-lg">Frete grátis • 6x sem juros</p>
            <div className="mt-10">
              <Link
                href="#catalogo"
                className="typo-btn inline-flex h-14 items-center justify-center rounded-2xl bg-primary px-10 text-primary-foreground shadow-[0_20px_50px_-20px_hsl(var(--primary))] transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Ver coleção
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <PromoStrip />

      <BrandsCarousel brands={brands} />

      <FeaturedProduct product={featured} />

      <Section>
        {products.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card/30 p-10 text-center">
            <p className="typo-small">
              Nenhum produto carregado. Configure{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">NEXT_PUBLIC_SUPABASE_URL</code> e{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> e
              insira registros na tabela <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">products</code>{" "}
              (veja <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">supabase/migrations</code>).
            </p>
          </div>
        ) : (
          <Suspense
            fallback={
              <div className="rounded-3xl border border-border bg-card p-10">
                <p className="typo-small">Carregando catálogo…</p>
              </div>
            }
          >
            <CatalogSection products={products} />
          </Suspense>
        )}
      </Section>

      <TestimonialsCarousel />
    </>
  );
}
