"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { STORE_LOGO, isStoreNameEyebrowText } from "@/lib/brand";

type Props = {
  eyebrow: string;
  eyebrowSizePx: number;
  eyebrowColor: string;
  textAlign: string;
};

export function StoreEyebrowContent({ eyebrow, eyebrowSizePx, eyebrowColor, textAlign }: Props) {
  if (isStoreNameEyebrowText(eyebrow)) {
    const h = Math.min(56, Math.max(22, eyebrowSizePx * 2.6));
    const justify =
      textAlign === "center" ? "justify-center" : textAlign === "right" ? "justify-end" : "justify-start";
    return (
      <div className={cn("flex w-full", justify)}>
        <Image
          src={STORE_LOGO.src}
          alt="Rei dos Calçados"
          width={STORE_LOGO.width}
          height={STORE_LOGO.height}
          className="h-auto w-auto max-w-[min(100%,280px)] object-contain"
          style={{ height: h, width: "auto" }}
        />
      </div>
    );
  }

  return (
    <p
      className="font-bold uppercase tracking-[0.28em]"
      style={{
        fontSize: eyebrowSizePx,
        color: eyebrowColor,
      }}
    >
      {eyebrow}
    </p>
  );
}
