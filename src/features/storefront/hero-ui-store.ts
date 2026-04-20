import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { normalizeHeroBadges, type HeroBadgeEntry } from "@/lib/hero-badge-icons";
import { createSafeLocalStorage } from "@/lib/persist-storage-local";

export type HeroTextAlign = "left" | "center" | "right";

export const HERO_UI_DEFAULTS = {
  overlayOpacity: 0.55,
  overlayColor: "#030712",
  gradientEnabled: true,
  gradientAngle: 180,
  gradientFrom: "rgba(3, 7, 18, 0.2)",
  gradientTo: "rgba(3, 7, 18, 0.82)",
  eyebrow: "Rei Dos Calçados",
  headline: "Calçados que não passam despercebidos.",
  /** Trecho exato do título que recebe gradiente / destaque visual (vazio = título uniforme) */
  headlineHighlight: "Calçados",
  headlineAccentFrom: "hsl(38 92% 56%)",
  headlineAccentTo: "hsl(0 0% 100%)",
  /** Selos do hero: texto + ícone manual ou «auto» (inferência por palavras-chave). */
  badges: [
    { label: "Frete grátis no Brasil", icon: "auto" },
    { label: "6x sem juros", icon: "auto" },
    { label: "Entrega rápida", icon: "auto" },
  ] satisfies HeroBadgeEntry[],
  subline: "Atitude urbana e estoque limitado nos hits da temporada — eleve o seu próximo look.",
  primaryLabel: "Explorar coleção",
  secondaryLabel: "Ver o que acabou de chegar",
  textAlign: "left" as HeroTextAlign,
  /** Canto superior esquerdo do bloco de texto, % da área útil (0–100; arraste limitado ao retângulo do hero) */
  contentLeftPct: 5,
  contentTopPct: 52,
  eyebrowSizePx: 10,
  headlineSizePx: 36,
  sublineSizePx: 15,
  eyebrowColor: "hsl(var(--primary))",
  headlineColor: "hsl(var(--foreground))",
  headlineWeight: 700 as 400 | 500 | 600 | 700,
  sublineColor: "hsl(var(--muted-foreground))",
  ctaBackgroundColor: "hsl(var(--primary))",
  ctaForegroundColor: "hsl(var(--primary-foreground))",
  secondaryLinkColor: "hsl(var(--muted-foreground))",
  useImageOverride: false,
  imageOverride: null as string | null,
  /** Dimensões da JPEG local após compressão (para next/image sem distorção). */
  imageOverrideWidth: null as number | null,
  imageOverrideHeight: null as number | null,
  /** Imagem opcional para viewport estreita (Tailwind md); proporção independente da desktop. */
  imageOverrideMobile: null as string | null,
  imageOverrideMobileWidth: null as number | null,
  imageOverrideMobileHeight: null as number | null,
  /** object-position (vídeo ou legado); imagens em largura total não usam recorte. */
  imageObjectPosition: "50% 52%",
};

export type HeroUiState = Omit<typeof HERO_UI_DEFAULTS, "badges"> & {
  badges: HeroBadgeEntry[];
};

type HeroUiActions = {
  patch: (p: Partial<HeroUiState>) => void;
  reset: () => void;
  setImageOverride: (
    dataUrl: string | null,
    useIt: boolean,
    /** Se definido ao enviar imagem, grava dimensões; omitir ao só alternar “usar local”. */
    dims?: { width: number; height: number } | null
  ) => void;
  setImageOverrideMobile: (
    dataUrl: string | null,
    dims?: { width: number; height: number } | null
  ) => void;
};

/** Base64 comprimido (~4/3 do binário); precisa cobrir JPEGs hero mais nitidos. */
export const MAX_PERSIST_HERO_IMAGE_CHARS = 300_000;

export const HERO_JPEG_COMPRESS_MAX_BYTES = 200_000;

export function sliceHeroStateForPersist(s: HeroUiState & HeroUiActions) {
  const { patch, reset, setImageOverride, setImageOverrideMobile, imageOverride, imageOverrideMobile, ...rest } = s;
  const cap = MAX_PERSIST_HERO_IMAGE_CHARS;

  const keepDesktop =
    typeof imageOverride === "string" && imageOverride.length > 0 && imageOverride.length <= cap;
  const keepMobile =
    typeof imageOverrideMobile === "string" && imageOverrideMobile.length > 0 && imageOverrideMobile.length <= cap;

  return {
    ...rest,
    imageOverride: keepDesktop ? imageOverride : null,
    useImageOverride: keepDesktop ? s.useImageOverride : false,
    imageOverrideWidth: keepDesktop ? s.imageOverrideWidth : null,
    imageOverrideHeight: keepDesktop ? s.imageOverrideHeight : null,
    imageOverrideMobile: keepMobile ? imageOverrideMobile : null,
    imageOverrideMobileWidth: keepMobile ? s.imageOverrideMobileWidth : null,
    imageOverrideMobileHeight: keepMobile ? s.imageOverrideMobileHeight : null,
  };
}

export const useHeroUiStore = create<HeroUiState & HeroUiActions>()(
  persist(
    (set) => ({
      ...HERO_UI_DEFAULTS,
      patch: (p) => set((s) => ({ ...s, ...p })),
      reset: () => set({ ...HERO_UI_DEFAULTS }),
      setImageOverride: (imageOverride, useImageOverride, dims) =>
        set({
          imageOverride,
          useImageOverride,
          ...(imageOverride === null
            ? {
                imageOverrideWidth: null,
                imageOverrideHeight: null,
                imageOverrideMobile: null,
                imageOverrideMobileWidth: null,
                imageOverrideMobileHeight: null,
              }
            : dims !== undefined
              ? {
                  imageOverrideWidth: dims?.width ?? null,
                  imageOverrideHeight: dims?.height ?? null,
                }
              : {}),
        }),
      setImageOverrideMobile: (imageOverrideMobile, dims) =>
        set({
          imageOverrideMobile,
          ...(imageOverrideMobile === null
            ? {
                imageOverrideMobileWidth: null,
                imageOverrideMobileHeight: null,
              }
            : dims !== undefined
              ? {
                  imageOverrideMobileWidth: dims?.width ?? null,
                  imageOverrideMobileHeight: dims?.height ?? null,
                }
              : {}),
        }),
    }),
    {
      name: "rdc-hero-ui-v1",
      storage: createJSONStorage(() => createSafeLocalStorage() as Storage),
      partialize: (s) => sliceHeroStateForPersist(s),
      merge: (persistedState, currentState) => {
        const p = persistedState as Partial<HeroUiState> | undefined;
        if (!p || typeof p !== "object") return currentState;
        const badgesSource = p.badges !== undefined ? p.badges : currentState.badges;
        return {
          ...currentState,
          ...p,
          badges: normalizeHeroBadges(badgesSource, currentState.badges),
        };
      },
    }
  )
);

const PERSIST_KEY = "rdc-hero-ui-v1";

export function flushHeroUiPersistence() {
  if (typeof window === "undefined") return;
  const slim = sliceHeroStateForPersist(useHeroUiStore.getState());
  try {
    window.localStorage.setItem(PERSIST_KEY, JSON.stringify({ state: slim, version: 0 }));
  } catch {
    /* quota ou modo privado */
  }
}
