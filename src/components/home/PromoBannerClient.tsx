"use client";

import { useCallback, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useBoundedPercentDrag } from "@/hooks/useBoundedPercentDrag";
import { BANNER_UI_DEFAULTS, useBannerUiStore } from "@/features/storefront/banner-ui-store";

type Props = {
  interactive?: boolean;
  editable?: boolean;
  bannerImageSizes?: string;
  bannerImageSizesMobile?: string;
};

const DEFAULT_BANNER_IMAGE_SIZES = "(max-width: 1920px) 100vw, 1600px";
const DEFAULT_BANNER_MOBILE_IMAGE_SIZES = "100vw";

const alignClass: Record<string, string> = {
  left: "text-left items-start",
  center: "text-center items-center",
  right: "text-right items-end",
};

export function PromoBannerClient({
  interactive = true,
  editable = false,
  bannerImageSizes = DEFAULT_BANNER_IMAGE_SIZES,
  bannerImageSizesMobile = DEFAULT_BANNER_MOBILE_IMAGE_SIZES,
}: Props) {
  const constraintsRef = useRef<HTMLDivElement>(null);
  const {
    enabled,
    image,
    imageMobile,
    overlayOpacity,
    overlayColor,
    gradientEnabled,
    gradientAngle,
    gradientFrom,
    gradientTo,
    eyebrow,
    headline,
    subline,
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
    imageObjectPosition,
    patch,
  } = useBannerUiStore();

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

  const ctaBackgroundColor = ctaBg ?? BANNER_UI_DEFAULTS.ctaBackgroundColor;
  const ctaForegroundColor = ctaFg ?? BANNER_UI_DEFAULTS.ctaForegroundColor;

  const onBannerTextCommit = useCallback(
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
    onCommit: onBannerTextCommit,
  });

  if (!enabled || !image) return null;

  return (
    <section className="border-b border-border/40">
      <div className="relative isolate w-full overflow-hidden bg-muted/20 [height:max(16rem,min(42svh,26rem))]">
        <div className="absolute inset-0 z-0">
          {imageMobile ? (
            <>
              <div className="absolute inset-0 md:hidden">
                <Image
                  src={imageMobile}
                  alt=""
                  fill
                  className="object-cover"
                  style={{ objectPosition: imageObjectPosition }}
                  sizes={bannerImageSizesMobile}
                  unoptimized={imageMobile.startsWith("data:")}
                />
              </div>
              <div className="absolute inset-0 hidden md:block">
                <Image
                  src={image}
                  alt=""
                  fill
                  className="object-cover"
                  style={{ objectPosition: imageObjectPosition }}
                  sizes={bannerImageSizes}
                  unoptimized={image.startsWith("data:")}
                />
              </div>
            </>
          ) : (
            <Image
              src={image}
              alt=""
              fill
              className="object-cover"
              style={{ objectPosition: imageObjectPosition }}
              sizes={bannerImageSizes}
              unoptimized={image.startsWith("data:")}
            />
          )}
        </div>

        {overlayOpacity > 0 && (
          <div className="pointer-events-none absolute inset-0 z-[1]" style={overlayStyle} aria-hidden />
        )}

        <div className="absolute inset-0 z-10 px-4 py-8 sm:px-6 lg:px-8">
          <div ref={constraintsRef} className="relative h-full min-h-0 w-full">
            <div
              ref={blockRef}
              className={cn(
                "pointer-events-auto flex w-[min(92vw,32rem)] max-w-full flex-col",
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
              style={{ fontSize: eyebrowSizePx, color: eyebrowColor }}
            >
              {eyebrow}
            </p>
            <h2
              className="mt-2 font-heading leading-tight tracking-tight break-words"
              style={{
                fontSize: `clamp(1.2rem, 2.6vw, ${headlineSizePx}px)`,
                color: headlineColor,
                fontWeight: headlineWeight,
              }}
            >
              {headline}
            </h2>
            <p className="mt-3 max-w-lg break-words" style={{ fontSize: sublineSizePx, color: sublineColor }}>
              {subline}
            </p>
            <Link
              href={interactive ? "/#catalogo" : "#"}
              className="mt-6 inline-flex h-10 w-fit items-center justify-center rounded-full px-6 text-[10px] font-bold uppercase tracking-[0.2em] transition-opacity hover:opacity-90"
              style={{ backgroundColor: ctaBackgroundColor, color: ctaForegroundColor }}
              onClick={(ev) => {
                if (!interactive) ev.preventDefault();
              }}
            >
              Ver catálogo
            </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
