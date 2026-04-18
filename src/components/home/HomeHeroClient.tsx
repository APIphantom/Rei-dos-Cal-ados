"use client";

import { useCallback, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useBoundedPercentDrag } from "@/hooks/useBoundedPercentDrag";
import { HERO_UI_DEFAULTS, useHeroUiStore } from "@/features/storefront/hero-ui-store";
export type HeroMedia = {
  type: "none" | "image" | "video";
  url: string | null;
};

type Props = {
  hero: HeroMedia;
  interactive?: boolean;
  /** Mostrado apenas em /admin/customize: arrasta o bloco de texto */
  editable?: boolean;
  /** Largura CSS esperada para `next/image` `sizes` (preview no admin ≠ largura real da home). */
  heroImageSizes?: string;
};

const alignClass: Record<string, string> = {
  left: "text-left items-start",
  center: "text-center items-center",
  right: "text-right items-end",
};

const DEFAULT_HERO_IMAGE_SIZES =
  "(max-width: 1920px) 100vw, 1920px";

export function HomeHeroClient({
  hero,
  interactive = true,
  editable = false,
  heroImageSizes = DEFAULT_HERO_IMAGE_SIZES,
}: Props) {
  /** Mesmo retângulo que define % de left/top do texto (deve ser o pai position:relative do bloco). */
  const constraintsRef = useRef<HTMLDivElement>(null);
  const {
    overlayOpacity,
    overlayColor,
    gradientEnabled,
    gradientAngle,
    gradientFrom,
    gradientTo,
    eyebrow,
    headline,
    subline,
    primaryLabel,
    secondaryLabel,
    textAlign,
    contentLeftPct,
    contentTopPct,
    eyebrowSizePx,
    headlineSizePx,
    sublineSizePx,
    eyebrowColor,
    headlineColor,
    headlineWeight,
    sublineColor,
    ctaBackgroundColor: ctaBg,
    ctaForegroundColor: ctaFg,
    secondaryLinkColor: secLink,
    useImageOverride,
    imageOverride,
    imageOverrideWidth,
    imageOverrideHeight,
    imageObjectPosition,
    patch,
  } = useHeroUiStore();

  const mediaUrl =
    useImageOverride && imageOverride
      ? imageOverride
      : hero.type === "image" && hero.url
        ? hero.url
        : null;

  const showVideo = !useImageOverride && hero.type === "video" && hero.url;

  const hasHeroImageDims =
    useImageOverride &&
    !!imageOverride &&
    typeof imageOverrideWidth === "number" &&
    typeof imageOverrideHeight === "number" &&
    imageOverrideWidth > 0 &&
    imageOverrideHeight > 0;

  const ctaBackgroundColor = ctaBg ?? HERO_UI_DEFAULTS.ctaBackgroundColor;
  const ctaForegroundColor = ctaFg ?? HERO_UI_DEFAULTS.ctaForegroundColor;
  const secondaryLinkColor = secLink ?? HERO_UI_DEFAULTS.secondaryLinkColor;

  const overlayStyle = useMemo(() => {
    if (gradientEnabled) {
      return {
        opacity: overlayOpacity,
        backgroundImage: `linear-gradient(${gradientAngle}deg, ${gradientFrom}, ${gradientTo})`,
      } as React.CSSProperties;
    }
    return {
      opacity: overlayOpacity,
      backgroundColor: overlayColor,
    } as React.CSSProperties;
  }, [gradientEnabled, gradientAngle, gradientFrom, gradientTo, overlayOpacity, overlayColor]);

  const onTextPositionCommit = useCallback(
    (left: number, top: number) => {
      patch({ contentLeftPct: left, contentTopPct: top });
    },
    [patch]
  );

  const { blockRef, dragProps, positionLeftPct, positionTopPct } = useBoundedPercentDrag({
    editable,
    constraintsRef,
    contentLeftPct,
    contentTopPct,
    onCommit: onTextPositionCommit,
  });

  const block = (
    <div
      ref={blockRef}
      className={cn(
        "pointer-events-auto flex w-[min(92vw,36rem)] max-w-full flex-col",
        alignClass[textAlign] ?? alignClass.left,
        editable && "cursor-grab touch-none select-none active:cursor-grabbing [&_a]:pointer-events-none"
      )}
      style={{
        position: "absolute",
        left: `${positionLeftPct}%`,
        top: `${positionTopPct}%`,
      }}
      {...(editable ? dragProps : {})}
    >
      <p
        className="font-bold uppercase tracking-[0.28em]"
        style={{
          fontSize: eyebrowSizePx,
          color: eyebrowColor,
        }}
      >
        {eyebrow}
      </p>
      <h1
        className="mt-3 font-heading leading-[1.08] tracking-tight"
        style={{
          fontSize: `clamp(1.35rem, 3.2vw, ${headlineSizePx}px)`,
          maxWidth: "20ch",
          color: headlineColor,
          fontWeight: headlineWeight,
        }}
      >
        {headline}
      </h1>
      <p
        className="mt-4 max-w-lg"
        style={{
          fontSize: sublineSizePx,
          color: sublineColor,
        }}
      >
        {subline}
      </p>
      <div className="mt-10 flex flex-wrap items-center gap-4">
        <Link
          href={interactive ? "#catalogo" : "#"}
          className="inline-flex h-11 items-center justify-center rounded-full px-8 text-[11px] font-bold uppercase tracking-[0.2em] transition-opacity hover:opacity-90"
          style={{ backgroundColor: ctaBackgroundColor, color: ctaForegroundColor }}
          onClick={(ev) => !interactive && ev.preventDefault()}
        >
          {primaryLabel}
        </Link>
        <Link
          href={interactive ? "#catalogo" : "#"}
          className="text-[11px] font-semibold uppercase tracking-[0.08em] underline-offset-4 transition-opacity hover:opacity-80"
          style={{ color: secondaryLinkColor }}
          onClick={(ev) => !interactive && ev.preventDefault()}
        >
          {secondaryLabel}
        </Link>
      </div>
    </div>
  );

  return (
    <section className="border-b border-border/40">
      <div className="relative isolate w-full overflow-hidden bg-muted/30">
        {mediaUrl &&
          (hasHeroImageDims ? (
            <Image
              src={mediaUrl}
              alt=""
              width={imageOverrideWidth!}
              height={imageOverrideHeight!}
              priority
              sizes={heroImageSizes}
              className="h-auto w-full max-w-full align-middle"
              unoptimized={mediaUrl.startsWith("data:")}
            />
          ) : (
            <img
              src={mediaUrl}
              alt=""
              className="block w-full h-auto max-w-full align-middle"
              decoding="async"
              fetchPriority="high"
            />
          ))}

        {showVideo && (
          <div className="relative z-0 h-[min(72svh,max(22rem,calc(100vw*9/21)))] w-full">
            <video
              className="absolute inset-0 z-0 h-full w-full object-cover"
              style={{ objectPosition: imageObjectPosition }}
              src={hero.url!}
              autoPlay
              muted
              loop
              playsInline
              aria-hidden
            />
          </div>
        )}

        {!mediaUrl && !showVideo && (
          <div
            className="relative z-0 min-h-[22rem] bg-gradient-to-br from-muted via-background to-muted md:min-h-[28rem]"
            aria-hidden
          />
        )}

        {overlayOpacity > 0 && (
          <div className="pointer-events-none absolute inset-0 z-[1]" style={overlayStyle} aria-hidden />
        )}

        {/* Área do texto e limites do arraste: ref = mesmo pai que define left%/top% */}
        <div className="absolute inset-0 z-10 px-4 py-10 sm:px-6 md:py-14 lg:px-8">
          <div ref={constraintsRef} className="relative h-full min-h-0 w-full">
            {block}
          </div>
        </div>
      </div>
    </section>
  );
}
