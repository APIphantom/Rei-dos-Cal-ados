"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircle, Sparkles } from "lucide-react";
import type { Product } from "@/types/product";
import { formatBRL } from "@/lib/money";
import { useStorePublicSettings } from "@/contexts/store-public-context";
import { buildProductWhatsAppUrlQuick } from "@/lib/whatsapp";

export function ProductCard({ product, index }: { product: Product; index: number }) {
  const { whatsappE164 } = useStorePublicSettings();
  const wa = buildProductWhatsAppUrlQuick(product, whatsappE164);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.45, delay: index * 0.05, ease: "easeOut" }}
      className="group flex flex-col"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-card">
        <Link
          href={`/product/${product.id}`}
          className="absolute inset-0 z-[1]"
          aria-label={`Ver ${product.name}`}
        />
        <Image
          src={product.images[0] ?? product.imageUrl}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
          loading={index < 4 ? "eager" : "lazy"}
          priority={index === 0}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />

        {product.isBestseller && (
          <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1 font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-background">
            <Sparkles className="h-3 w-3" />
            Mais vendido
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="typo-btn rounded-xl bg-primary px-6 py-3 text-primary-foreground">
            Ver produto
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-1 flex-col gap-3">
        <div>
          <p className="typo-label">{product.brand}</p>
          <p className="font-body mt-1 line-clamp-2 text-sm font-medium leading-snug text-foreground">
            {product.name}
          </p>
          <p className="typo-price mt-2">{formatBRL(product.price)}</p>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-2">
          <Link
            href={`/product/${product.id}`}
            className="typo-btn-sm inline-flex h-10 items-center justify-center rounded-xl border border-border bg-card/60 transition-colors hover:border-primary/60"
          >
            Ver produto
          </Link>
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="typo-btn-sm inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-primary text-primary-foreground transition-transform active:scale-[0.98]"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
        </div>
      </div>
    </motion.div>
  );
}
