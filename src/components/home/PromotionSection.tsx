import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/container";
import type { Promotion } from "@/types/promotion";

export function PromotionSection({ promotions }: { promotions: Promotion[] }) {
  if (promotions.length === 0) return null;

  return (
    <section className="border-y border-primary/15 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,.08),transparent_60%),linear-gradient(180deg,#0b0b0a,#090909)] py-10 sm:py-14">
      <Container className="space-y-6 sm:space-y-8">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
            <Sparkles className="h-3.5 w-3.5" aria-hidden /> Ofertas da loja
          </p>
          <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl">Promoções em destaque</h2>
        </div>

        <div className="space-y-5">
          {promotions.map((promotion) => {
            const external = /^https:\/\//i.test(promotion.ctaHref);
            return (
              <article key={promotion.id} className="grid min-w-0 overflow-hidden rounded-2xl border border-white/[0.09] bg-[#11110f] shadow-[0_24px_64px_-36px_rgba(245,158,11,.3)] md:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
                <div className="relative aspect-[4/3] min-h-0 overflow-hidden bg-black md:aspect-auto md:min-h-[340px]">
                  <Image
                    src={promotion.imageUrl}
                    alt={promotion.imageAlt || "Imagem ilustrativa da promoção"}
                    fill
                    sizes="(max-width: 767px) 100vw, 50vw"
                    className="object-cover"
                  />
                  <span className="absolute bottom-3 left-3 rounded-full border border-white/15 bg-black/75 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-white/85">
                    Imagem ilustrativa
                  </span>
                </div>
                <div className="flex min-w-0 flex-col items-start justify-center p-5 sm:p-8 lg:p-10">
                  <span className="rounded-full border border-primary/30 bg-primary/[0.08] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                    {promotion.offerType === "kit" ? "Oferta de kit" : "Promoção"}
                  </span>
                  <h3 className="mt-4 max-w-xl break-words font-heading text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
                    {promotion.title}
                  </h3>
                  <p className="mt-3 max-w-xl break-words text-base leading-relaxed text-zinc-300 sm:text-lg">{promotion.shortText}</p>
                  {promotion.commercialText && <p className="mt-3 max-w-xl break-words text-sm leading-relaxed text-zinc-500">{promotion.commercialText}</p>}
                  {external ? (
                    <a href={promotion.ctaHref} target="_blank" rel="noreferrer" className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5">
                      {promotion.ctaLabel}<ArrowUpRight className="h-4 w-4" aria-hidden />
                    </a>
                  ) : (
                    <Link href={promotion.ctaHref} className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5">
                      {promotion.ctaLabel}<ArrowUpRight className="h-4 w-4" aria-hidden />
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
