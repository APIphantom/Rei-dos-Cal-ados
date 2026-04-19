"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

const PLACEHOLDER = "/placeholder.svg";

type Props = {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
};

export function AdminImage({ src, alt, className, fill, width, height, sizes, priority }: Props) {
  const [failed, setFailed] = useState(false);
  const effective = failed || !src ? PLACEHOLDER : src;
  const unoptimized =
    effective.startsWith("data:") || effective.startsWith("blob:") || effective === PLACEHOLDER;

  if (fill) {
    return (
      <Image
        src={effective}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        unoptimized={unoptimized}
        onError={() => setFailed(true)}
        className={cn("object-cover", className)}
      />
    );
  }

  return (
    <Image
      src={effective}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      unoptimized={unoptimized}
      onError={() => setFailed(true)}
      className={cn("object-cover", className)}
    />
  );
}
