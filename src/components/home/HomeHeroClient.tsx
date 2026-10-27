"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { normalizeHeroBadges, resolveHeroBadgeIcon } from "@/lib/hero-badge-icons";
import { HERO_UI_DEFAULTS, useHeroUiStore } from "@/features/storefront/hero-ui-store";
import {
  BUNDLED_HERO_ART_URL,
  BUNDLED_HERO_DESKTOP_WEBP_URL,
  BUNDLED_HERO_MOBILE_ART_URL,
  BUNDLED_HERO_MOBILE_WEBP_URL,
} from "@/lib/hero-media";

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

/**
 * Pedimos ~10% a mais que a largura útil para compensar o zoom do .hero-ken-burns (até +8,5%)
 * e telas retina, sem esticar tanto quanto 2× o viewport inteiro.
 */
const DEFAULT_HERO_IMAGE_SIZES =
  "(max-width: 767px) 100vw, min(110vw, 2560px)";
const DEFAULT_HERO_MOBILE_IMAGE_SIZES = "100vw";

/** A qualidade alta reduz artefatos visíveis em texto e detalhes do hero. */
const HERO_IMAGE_QUALITY = 98;

const HERO_MEDIA_VIEWPORT =
  "relative z-0 h-[min(50svh,84vw)] min-h-[12rem] w-full overflow-hidden md:h-[min(72svh,max(22rem,calc(100vw*9/21)))]";
const HERO_BUNDLED_ART_VIEWPORT =
  "relative z-0 h-[min(90svh,177.78vw)] min-h-[18rem] w-full overflow-hidden md:h-[min(72svh,max(22rem,calc(100vw*9/21)))]";

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
  const bundledMobileHeroUrl =
    !useImageOverride && hero.type === "image" && hero.url === BUNDLED_HERO_ART_URL
      ? BUNDLED_HERO_MOBILE_ART_URL
      : null;

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

  const motionLite =
    editable || prefersReducedMotion === true || narrowViewport;

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
        className="inline-flex items-center gap-3 font-bold uppercase tracking-[0.28em] drop-shadow-[0_2px_12px_rgba(0,0,0,.8)] before:h-px before:w-8 before:bg-primary before:content-['']"
        style={{ fontSize: eyebrowSizePx, color: eyebrowColor }}
        initial={motionLite ? false : { opacity: 0, y: 12, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.45, delay: seq * 2, ease: EASE }}
      >
        {eyebrow}
      </motion.p>

      <motion.h1
        className="mt-3 break-words font-heading leading-[0.98] tracking-[-0.035em] drop-shadow-[0_4px_28px_rgba(0,0,0,.7)]"
        style={{
          fontSize: `clamp(1.375rem, 4.4vw, ${headlineSizePx}px)`,
          maxWidth: "min(16ch, 92vw)",
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
        className="mt-4 max-w-lg break-words leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,.9)]"
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
            "mt-6 flex max-w-xl flex-wrap gap-2"
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
              className="inline-flex cursor-default select-none items-center gap-1.5 rounded-lg border border-white/20 bg-black/40 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white shadow-[inset_0_1px_0_hsl(0_0%_100%/0.12)] backdrop-blur-md transition-colors duration-300 hover:border-primary/70 hover:bg-black/55 md:gap-2 md:px-3.5 md:py-2 md:text-[11px]"
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
        className="mt-6 flex w-full flex-col items-stretch gap-3 sm:mt-8 sm:w-auto sm:flex-row sm:items-center sm:gap-4"
        initial={motionLite ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: seq * 6.5, ease: EASE }}
      >
        <motion.div whileTap={motionLite ? undefined : { scale: 0.98 }}>
          <Link
            href={interactive ? "#catalogo" : "#"}
            className="typo-btn group relative inline-flex h-12 min-h-[48px] w-full items-center justify-center overflow-hidden rounded-xl px-7 shadow-[0_12px_40px_-12px_hsl(38_92%_45%/0.55)] ring-1 ring-white/10 transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_48px_-10px_hsl(38_92%_50%/0.65)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:w-auto md:h-12"
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
            className="typo-btn-sm inline-flex h-12 min-h-[44px] w-full items-center justify-center rounded-xl border border-white/30 bg-black/20 px-6 text-white/90 backdrop-blur-sm transition-all duration-300 hover:border-white/65 hover:bg-black/35 hover:text-white sm:w-auto md:h-12"
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
      className={cn(
        "pointer-events-auto flex w-full max-w-[42rem] flex-col items-start text-left lg:max-w-[min(35rem,42vw)]",
        editable && "select-none [&_a]:pointer-events-none"
      )}
    >
      <div className="flex w-full flex-col">{contentShell}</div>
    </div>
  );

  const heroImageObjectPosition = showVideo ? imageObjectPosition : "50% 52%";

  return (
    <section className="relative border-b border-border/40">
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
                      style={{ objectPosition: heroImageObjectPosition }}
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
                      style={{ objectPosition: heroImageObjectPosition }}
                      unoptimized={imageOverride!.startsWith("data:")}
                    />
                  </div>
                </motion.div>
              </div>
            </>
          ) : bundledMobileHeroUrl ? (
            <div className={HERO_BUNDLED_ART_VIEWPORT}>
              <picture className="absolute inset-0 z-0 block h-full w-full">
                {!editable && (
                  <>
                    <source
                      media="(max-width: 767px)"
                      srcSet={BUNDLED_HERO_MOBILE_WEBP_URL}
                      type="image/webp"
                    />
                    <source media="(max-width: 767px)" srcSet={bundledMobileHeroUrl} />
                  </>
                )}
                <source srcSet={BUNDLED_HERO_DESKTOP_WEBP_URL} type="image/webp" />
                <img
                  src={mediaUrl}
                  width={2067}
                  height={761}
                  alt=""
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{ objectPosition: heroImageObjectPosition }}
                />
              </picture>
            </div>
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
                    style={{ objectPosition: heroImageObjectPosition }}
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
            className="pointer-events-none absolute inset-0 z-[2]"
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

        <div
          className="hero-editorial-shade pointer-events-none absolute inset-0 z-[3]"
          style={{ opacity: overlayOpacity * 0.6 }}
          aria-hidden
        />

      </div>
      <div className="relative z-10 bg-gradient-to-b from-black via-neutral-950 to-[#090909] px-4 py-8 sm:px-6 lg:absolute lg:inset-0 lg:flex lg:items-center lg:bg-none lg:px-8 lg:py-14">
        <div className="mx-auto flex w-full max-w-[1280px] items-center">
          {block}
        </div>
      </div>
    </section>
  );
}
