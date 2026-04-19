import Link from "next/link";
import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { BrandsCarousel } from "@/components/home/BrandsCarousel";
import { FeaturedProduct } from "@/components/home/FeaturedProduct";
import { HomeHero } from "@/components/home/HomeHero";
import { PromoBannerClient } from "@/components/home/PromoBannerClient";
import { TestimonialsCarousel } from "@/components/home/TestimonialsCarousel";
import { CatalogSection } from "@/features/products/components/CatalogSection";
import { STORE_BRANDS } from "@/config/store-brands";
import { getAllProducts, getFeaturedProduct } from "@/features/products/services/products";

export default async function HomePage() {
  const [products, featured] = await Promise.all([getAllProducts(), getFeaturedProduct()]);

  return (
    <>
      <HomeHero />

      <PromoBannerClient />

      <BrandsCarousel brands={STORE_BRANDS} />

      <FeaturedProduct product={featured} />

      <section className="border-b border-border/40 py-12 md:py-16">
        <Container>
          {products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/50 bg-card/[0.2] p-10 text-center">
              <p className="text-sm text-muted-foreground">
                Nenhum produto no catálogo ainda. Cadastre itens em{" "}
                <span className="text-foreground">Admin → Produtos</span>.
              </p>
            </div>
          ) : (
            <Suspense
              fallback={
                <div className="rounded-2xl border border-border/40 bg-card/[0.2] p-10">
                  <p className="text-sm text-muted-foreground">Carregando catálogo…</p>
                </div>
              }
            >
              <CatalogSection products={products} />
            </Suspense>
          )}
        </Container>
      </section>

      <TestimonialsCarousel />

      <section className="py-10 md:py-12">
        <Container className="flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-10 text-center md:flex-row md:text-left">
          <p className="text-xs text-muted-foreground">Dúvidas? Fale com a gente no WhatsApp.</p>
          <Link
            href="/#catalogo"
            className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary transition-opacity hover:opacity-80"
          >
            Voltar ao catálogo
          </Link>
        </Container>
      </section>
    </>
  );
}
