"use client";

import Image from "next/image";
import { useState } from "react";
import type { StoreBrand } from "@/config/store-brands";
import { cn } from "@/lib/utils";

/** Caixa fixa para todas as marcas: mesma área visível (object-contain). */
const LOGO_BOX = "relative h-14 w-[132px] max-w-full shrink-0 sm:h-[60px] sm:w-[148px]";

type Props = {
  brand: StoreBrand;
  className?: string;
};

export function BrandLogoImage({ brand, className }: Props) {
  const [failed, setFailed] = useState(false);
  const initial = brand.name.trim().slice(0, 2).toUpperCase();

  if (failed) {
    return (
      <span
        className={cn(
          LOGO_BOX,
          "flex items-center justify-center rounded-xl border border-border/40 bg-muted/30 text-[12px] font-bold tracking-tight text-muted-foreground",
          className
        )}
        aria-hidden
      >
        {initial}
      </span>
    );
  }

  return (
    <div className={cn(LOGO_BOX, className)}>
      <Image
        src={brand.logoUrl}
        alt=""
        fill
        sizes="148px"
        unoptimized
        onError={() => setFailed(true)}
        className="brand-logo-orange object-contain object-center p-1.5 opacity-90 transition-opacity duration-300 group-hover:opacity-100"
      />
    </div>
  );
}
