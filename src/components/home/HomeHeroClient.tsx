"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { normalizeHeroBadges, resolveHeroBadgeIcon } from "@/lib/hero-badge-icons";
import { useBoundedPercentDrag } from "@/hooks/useBoundedPercentDrag";
import { HERO_UI_DEFAULTS, useHeroUiStore } from "@/features/storefront/hero-ui-store";

export type HeroMedia = {
  type: "none" | "image" | "video";
  url: string | null;
};

type Props = {
  hero: HeroMedia;
  interactive?: boolean;
  editable?: boolean;
  heroImageSizes?: string;
  heroImageSizesMobile?: string;
};

const alignClass: Record<string, string> = {
  left: "text-left items-start",
  center: "text-center items-center",
  right: "text-right items-end",
};

/**
 * Pedimos ~10% a mais que a largura útil para compensar o zoom do .hero-ken-burns (até +8,5%)
 * e telas retina, sem esticar tanto quanto 2× o viewport inteiro.
 */
const DEFAULT_HERO_IMAGE_SIZES =
  "(max-width: 767px) min(110vw, 900px), min(110vw, 2560px)";
const DEFAULT_HERO_MOBILE_IMAGE_SIZES = "min(110vw, 900px)";

/** Next/Image default é 75; heros panorâmicos beneficiam de JPEG/WebP mais fiéis. */
const HERO_IMAGE_QUALITY = 90;

const HERO_MEDIA_VIEWPORT =
  "relative z-0 h-[min(72svh,max(22rem,calc(100vw*9/21)))] w-full overflow-hidden";

const STAGGER = 0.065;
const EASE = [0.22, 1, 0.36, 1] as const;

function splitHeadline(headline: string, highlight: string) {
  const h = highlight.trim();
  if (!h) return { before: headline, mid: null as string | null, after: "" };
  const i = headline.indexOf(h);
  if (i < 0) return { before: headline, mid: null, after: "" };
  return {
    before: headline.slice(0, i),
    mid: h,
    after: headline.slice(i + h.length),
  };
}

export function HomeHeroClient({
  hero,
  interactive = true,
  editable = false,
  heroImageSizes = DEFAULT_HERO_IMAGE_SIZES,
  heroImageSizesMobile = DEFAULT_HERO_MOBILE_IMAGE_SIZES,
}: Props) {
  const prefersReducedMotion = useReducedMotion();
  const constraintsRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [narrowViewport, setNarrowViewport] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const sync = () => setNarrowViewport(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

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
    headlineHighlight,
    headlineAccentFrom,
    headlineAccentTo,
    badges: badgesRaw,
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
    imageOverrideMobile,
    imageOverrideMobileWidth,
    imageOverrideMobileHeight,
    imageObjectPosition,
    patch,
  } = useHeroUiStore();

  const badges = useMemo(
    () => normalizeHeroBadges(badgesRaw, HERO_UI_DEFAULTS.badges),
    [badgesRaw]
  );

  const highlightPhrase = (headlineHighlight ?? HERO_UI_DEFAULTS.headlineHighlight)?.trim() ?? "";
  const accentFrom = headlineAccentFrom ?? HERO_UI_DEFAULTS.headlineAccentFrom;
  const accentTo = headlineAccentTo ?? HERO_UI_DEFAULTS.headlineAccentTo;

  const { before: headBefore, mid: headMid, after: headAfter } = useMemo(
    () => splitHeadline(headline, highlightPhrase),
    [headline, highlightPhrase]
  );

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

  const hasHeroMobileDims =
    useImageOverride &&
    !!imageOverrideMobile &&
    typeof imageOverrideMobileWidth === "number" &&
    typeof imageOverrideMobileHeight === "number" &&
    imageOverrideMobileWidth > 0 &&
    imageOverrideMobileHeight > 0;

  const showDualLocalHero = Boolean(hasHeroImageDims && hasHeroMobileDims);

  const ctaBackgroundColor = ctaBg ?? HERO_UI_DEFAULTS.ctaBackgroundColor;
  const ctaForegroundColor = ctaFg ?? HERO_UI_DEFAULTS.ctaForegroundColor;
  const secondaryLinkColor = secLink ?? HERO_UI_DEFAULTS.secondaryLinkColor;

  const overlayBackdrop = useMemo(() => {
    if (gradientEnabled) {
      return {
        backgroundImage: `linear-gradient(${gradientAngle}deg, ${gradientFrom}, ${gradientTo})`,
      };
    }
    return { backgroundColor: overlayColor };
  }, [gradientEnabled, gradientAngle, gradientFrom, gradientTo, overlayColor]);

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

  const motionLite =
    editable || prefersReducedMotion === true || narrowViewport;
  const showParallax =
    !editable && prefersReducedMotion !== true && !narrowViewport;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const parallaxMax = narrowViewport ? 14 : 32;
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, showParallax ? parallaxMax : 0]);

  const mediaVariants = {
    hidden: { opacity: motionLite ? 1 : 0, scale: motionLite ? 1 : 1.03 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: motionLite ? 0.01 : 0.85, ease: EASE },
    },
  };


  const seq = motionLite ? 0 : STAGGER;

  const contentShell = (
    <>
      <motion.p
        className="font-bold uppercase tracking-[0.28em]"
        style={{ fontSize: eyebrowSizePx, color: eyebrowColor }}
        initial={motionLite ? false : { opacity: 0, y: 12, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.45, delay: seq * 2, ease: EASE }}
      >
        {eyebrow}
      </motion.p>

      <motion.h1
        className="mt-3 break-words font-heading leading-[1.06] tracking-tight"
        style={{
          fontSize: `clamp(1.35rem, 3.2vw, ${headlineSizePx}px)`,
          maxWidth: "min(20ch, 92vw)",
          color: headlineColor,
          fontWeight: headlineWeight,
        }}
        initial={motionLite ? false : { opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.58, delay: seq * 3, ease: EASE }}
      >
        {headMid ? (
          <>
            <span className="text-[inherit]">{headBefore}</span>
            <span
              className="bg-clip-text text-transparent [text-shadow:none]"
              style={{
                backgroundImage: `linear-gradient(102deg, ${accentFrom}, ${accentTo})`,
                filter: "drop-shadow(0 0 28px hsl(38 92% 50% / 0.22))",
              }}
            >
              {headMid}
            </span>
            <span className="text-[inherit]">{headAfter}</span>
          </>
        ) : (
          headline
        )}
      </motion.h1>

      <motion.p
        className="mt-4 max-w-lg break-words leading-relaxed"
        style={{ fontSize: sublineSizePx, color: sublineColor }}
        initial={motionLite ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: seq * 4, ease: EASE }}
      >
        {subline}
      </motion.p>

      {badges.length > 0 && (
        <motion.div
          className={cn(
            "mt-6 flex max-w-xl flex-wrap gap-2",
            textAlign === "center" && "justify-center",
            textAlign === "right" && "justify-end"
          )}
          initial={motionLite ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, delay: seq * 5 }}
        >
          {badges.map((entry, i) => {
            const BadgeIcon = resolveHeroBadgeIcon(entry);
            return (
            <motion.span
              key={`${entry.label}-${i}`}
              className="inline-flex cursor-default select-none items-center gap-1.5 rounded-full border border-primary/50 bg-primary/[0.07] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-primary shadow-[inset_0_1px_0_hsl(var(--primary)/0.12)] backdrop-blur-sm transition-colors duration-300 hover:border-primary hover:bg-primary/15 md:gap-2 md:px-3.5 md:py-2 md:text-[11px]"
              initial={motionLite ? false : { opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, delay: seq * (5.5 + i * 0.35), ease: EASE }}
              whileHover={
                motionLite
                  ? undefined
                  : { scale: 1.04, transition: { type: "spring", stiffness: 420, damping: 22 } }
              }
              whileTap={motionLite ? undefined : { scale: 0.98 }}
            >
              <BadgeIcon className="h-3 w-3 shrink-0 md:h-3.5 md:w-3.5" strokeWidth={2.25} aria-hidden />
              {entry.label}
            </motion.span>
            );
          })}
        </motion.div>
      )}

      <motion.div
        className={cn("mt-8 flex flex-wrap items-center gap-3 sm:gap-4", textAlign === "center" && "justify-center")}
        initial={motionLite ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: seq * 6.5, ease: EASE }}
      >
        <motion.div whileTap={motionLite ? undefined : { scale: 0.98 }}>
          <Link
            href={interactive ? "#catalogo" : "#"}
            className="typo-btn group relative inline-flex h-12 min-h-[48px] items-center justify-center overflow-hidden rounded-full px-9 shadow-[0_12px_40px_-12px_hsl(38_92%_45%/0.55)] ring-1 ring-white/10 transition-shadow duration-300 hover:shadow-[0_18px_48px_-10px_hsl(38_92%_50%/0.65)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background md:h-11"
            style={{ backgroundColor: ctaBackgroundColor, color: ctaForegroundColor }}
            onClick={(ev) => !interactive && ev.preventDefault()}
          >
            <span
              className="pointer-events-none absolute inset-0 opacity-0 mix-blend-screen transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background: `radial-gradient(circle at 30% 30%, hsl(0 0% 100% / 0.35), transparent 55%)`,
              }}
              aria-hidden
            />
            <motion.span
              className="relative z-[1]"
              whileHover={motionLite ? undefined : { y: -1 }}
              transition={{ type: "spring", stiffness: 500, damping: 28 }}
            >
              {primaryLabel}
            </motion.span>
          </Link>
        </motion.div>

        <motion.div whileTap={motionLite ? undefined : { scale: 0.98 }}>
          <Link
            href={interactive ? "#catalogo" : "#"}
            className="typo-btn-sm inline-flex h-11 min-h-[44px] items-center justify-center rounded-full border border-white/18 bg-transparent px-6 text-white/85 transition-all duration-300 hover:border-primary/55 hover:bg-white/[0.06] hover:text-white md:h-10"
            style={{ color: secondaryLinkColor }}
            onClick={(ev) => !interactive && ev.preventDefault()}
          >
            {secondaryLabel}
          </Link>
        </motion.div>
      </motion.div>
    </>
  );

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
      {showParallax ? (
        <motion.div style={{ y: parallaxY }} className="flex w-full flex-col will-change-transform">
          {contentShell}
        </motion.div>
      ) : (
        <div className="flex w-full flex-col">{contentShell}</div>
      )}
    </div>
  );

  return (
    <section ref={sectionRef} className="border-b border-border/40">
      <div className="relative isolate w-full overflow-hidden bg-black">
        {mediaUrl &&
          (showDualLocalHero ? (
            <>
              <div className={`md:hidden ${HERO_MEDIA_VIEWPORT}`}>
                <motion.div
                  className="absolute inset-0"
                  variants={mediaVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <div
                    className={cn(
                      "absolute inset-0 overflow-hidden",
                      !motionLite && "hero-ken-burns"
                    )}
                  >
                    <Image
                      src={imageOverrideMobile!}
                      alt=""
                      fill
                      priority
                      quality={HERO_IMAGE_QUALITY}
                      sizes={heroImageSizesMobile}
                      className="object-cover"
                      style={{ objectPosition: imageObjectPosition }}
                      unoptimized={imageOverrideMobile!.startsWith("data:")}
                    />
                  </div>
                </motion.div>
              </div>
              <div className={`hidden md:block ${HERO_MEDIA_VIEWPORT}`}>
                <motion.div
                  className="absolute inset-0"
                  variants={mediaVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <div
                    className={cn(
                      "absolute inset-0 overflow-hidden",
                      !motionLite && "hero-ken-burns"
                    )}
                  >
                    <Image
                      src={imageOverride!}
                      alt=""
                      fill
                      priority
                      quality={HERO_IMAGE_QUALITY}
                      sizes={heroImageSizes}
                      className="object-cover"
                      style={{ objectPosition: imageObjectPosition }}
                      unoptimized={imageOverride!.startsWith("data:")}
                    />
                  </div>
                </motion.div>
              </div>
            </>
          ) : (
            <div className={HERO_MEDIA_VIEWPORT}>
              <motion.div
                className="absolute inset-0"
                variants={mediaVariants}
                initial="hidden"
                animate="visible"
              >
                <div
                  className={cn(
                    "absolute inset-0 overflow-hidden",
                    !motionLite && "hero-ken-burns"
                  )}
                >
                  <Image
                    src={mediaUrl}
                    alt=""
                    fill
                    priority
                    quality={HERO_IMAGE_QUALITY}
                    sizes={heroImageSizes}
                    className="object-cover"
                    style={{ objectPosition: imageObjectPosition }}
                    unoptimized={mediaUrl.startsWith("data:")}
                  />
                </div>
              </motion.div>
            </div>
          ))}

        {showVideo && (
          <div className={HERO_MEDIA_VIEWPORT}>
            <motion.div
              className="absolute inset-0"
              variants={mediaVariants}
              initial="hidden"
              animate="visible"
            >
              <div
                className={cn(
                  "absolute inset-0 overflow-hidden",
                  !motionLite && "hero-ken-burns"
                )}
              >
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
            </motion.div>
          </div>
        )}

        {!mediaUrl && !showVideo && (
          <motion.div
            className={`${HERO_MEDIA_VIEWPORT} bg-gradient-to-br from-neutral-950 via-background to-neutral-950`}
            aria-hidden
            variants={mediaVariants}
            initial="hidden"
            animate="visible"
          />
        )}

        {!motionLite && (
          <div
            className="pointer-events-none absolute inset-0 z-[1] mix-blend-soft-light hero-ambient-sheen"
            aria-hidden
          />
        )}

        {overlayOpacity > 0 && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-[2] backdrop-blur-[1px]"
            style={overlayBackdrop}
            aria-hidden
            initial={{ opacity: motionLite ? overlayOpacity : 0 }}
            animate={{ opacity: overlayOpacity }}
            transition={{
              duration: motionLite ? 0.01 : 0.55,
              delay: motionLite ? 0 : 0.08,
              ease: EASE,
            }}
          />
        )}

        <div className="absolute inset-0 z-10 px-4 py-10 sm:px-6 md:py-14 lg:px-8">
          <div ref={constraintsRef} className="relative h-full min-h-0 w-full">
            {block}
          </div>
        </div>
      </div>
    </section>
  );
}
