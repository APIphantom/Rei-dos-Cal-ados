import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/types/product";
import { Container } from "@/components/ui/container";
import { formatBRL } from "@/lib/money";

export function FeaturedProduct({ product }: { product: Product | null }) {
  if (!product) return null;

  return (
    <section className="py-12 md:py-16">
      <Container>
        <div className="overflow-hidden rounded-[2rem] border border-border bg-card/40">
          <div className="grid gap-0 lg:grid-cols-2">
            <div className="relative aspect-[4/5] min-h-[320px] lg:aspect-auto lg:min-h-[480px]">
              <Image
                src={product.images[0] ?? product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 50vw, 100vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent lg:bg-gradient-to-r" />
            </div>
            <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16">
              <p className="typo-overline">Destaque da semana</p>
              <h2 className="typo-h3 mt-3">{product.name}</h2>
              <p className="typo-body-muted mt-4 line-clamp-4 md:text-base">
                {product.description}
              </p>
              <p className="typo-price-lg mt-6">{formatBRL(product.price)}</p>
              <Link
                href={`/product/${product.id}`}
                className="typo-btn mt-8 inline-flex h-12 w-fit items-center gap-2 rounded-xl bg-primary px-8 text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Ver produto
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
