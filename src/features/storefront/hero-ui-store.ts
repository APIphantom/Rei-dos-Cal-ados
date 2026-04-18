import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
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
  headline: "Estilo começa pelos pés",
  subline: "Frete grátis · 6x sem juros",
  primaryLabel: "Ver coleção",
  secondaryLabel: "Ir ao catálogo",
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
  /** object-position (vídeo ou legado); imagens em largura total não usam recorte. */
  imageObjectPosition: "50% 52%",
};

export type HeroUiState = typeof HERO_UI_DEFAULTS;

type HeroUiActions = {
  patch: (p: Partial<HeroUiState>) => void;
  reset: () => void;
  setImageOverride: (
    dataUrl: string | null,
    useIt: boolean,
    /** Se definido ao enviar imagem, grava dimensões; omitir ao só alternar “usar local”. */
    dims?: { width: number; height: number } | null
  ) => void;
};

/** Base64 maior que isso não entra no localStorage (evita QuotaExceededError). */
const MAX_PERSIST_IMAGE_CHARS = 380_000;

export function sliceHeroStateForPersist(s: HeroUiState & HeroUiActions) {
  const { patch, reset, setImageOverride, imageOverride, ...rest } = s;
  const keepImg =
    typeof imageOverride === "string" && imageOverride.length > 0 && imageOverride.length <= MAX_PERSIST_IMAGE_CHARS;
  return {
    ...rest,
    imageOverride: keepImg ? imageOverride : null,
    useImageOverride: keepImg ? s.useImageOverride : false,
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
            ? { imageOverrideWidth: null, imageOverrideHeight: null }
            : dims !== undefined
              ? {
                  imageOverrideWidth: dims?.width ?? null,
                  imageOverrideHeight: dims?.height ?? null,
                }
              : {}),
        }),
    }),
    {
      name: "rdc-hero-ui-v1",
      storage: createJSONStorage(() => createSafeLocalStorage() as Storage),
      partialize: (s) => sliceHeroStateForPersist(s),
    }
  )
);

const PERSIST_KEY = "rdc-hero-ui-v1";

/** Grava o estado atual no localStorage (redundante ao persist, útil no botão Salvar). */
export function flushHeroUiPersistence() {
  if (typeof window === "undefined") return;
  const slim = sliceHeroStateForPersist(useHeroUiStore.getState());
  try {
    window.localStorage.setItem(PERSIST_KEY, JSON.stringify({ state: slim, version: 0 }));
  } catch {
    /* quota ou modo privado */
  }
}
