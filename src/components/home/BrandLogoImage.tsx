"use client";

import Image from "next/image";
import { useState } from "react";
import type { StoreBrand } from "@/config/store-brands";
import { cn } from "@/lib/utils";

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
        className={`brand-logo-orange flex h-12 w-[120px] max-w-[90%] items-center justify-center rounded-lg bg-muted/40 text-[13px] font-bold tracking-tight text-muted-foreground ${className ?? ""}`}
        aria-hidden
      >
        {initial}
      </span>
    );
  }

  return (
    <Image
      src={brand.logoUrl}
      alt=""
      width={120}
      height={48}
      sizes="120px"
      unoptimized
      onError={() => setFailed(true)}
      className={cn(
        "brand-logo-orange h-12 w-auto max-w-[90%] object-contain object-center opacity-90 transition-opacity duration-300 group-hover:opacity-100",
        className
      )}
    />
  );
}
