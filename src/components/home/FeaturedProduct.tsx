import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/types/product";
import { Container } from "@/components/ui/container";
import { formatBRL } from "@/lib/money";

export function FeaturedProduct({ product }: { product: Product | null }) {
  if (!product) return null;

  return (
    <section className="border-b border-border/40 py-12 md:py-16">
      <Container>
        <div className="mb-8 max-w-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">Destaque</p>
          <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground md:text-[1.65rem]">
            Da semana
          </h2>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border/40 bg-card/[0.35]">
          <div className="grid gap-0 lg:grid-cols-2">
            <div className="relative aspect-[4/5] min-h-[280px] lg:aspect-auto lg:min-h-[420px]">
              <Image
                src={product.images[0] ?? product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 50vw, 100vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-background/40" />
            </div>
            <div className="flex flex-col justify-center p-8 md:p-12 lg:p-14">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{product.brand}</p>
              <h3 className="mt-2 font-heading text-xl font-bold tracking-tight md:text-2xl">{product.name}</h3>
              <p className="mt-4 line-clamp-2 text-sm text-muted-foreground md:line-clamp-3 md:text-base">
                {product.description}
              </p>
              <p className="mt-6 font-heading text-xl font-bold text-primary md:text-2xl">{formatBRL(product.price)}</p>
              <Link
                href={`/product/${product.id}`}
                className="mt-8 inline-flex w-fit items-center gap-2 rounded-full border border-border/60 bg-background/40 px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-foreground transition-colors hover:border-primary/50 hover:bg-primary/10"
              >
                Ver produto
                <ArrowRight className="h-4 w-4 text-primary" />
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
