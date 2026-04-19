import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createSafeLocalStorage } from "@/lib/persist-storage-local";
import type { HeroTextAlign } from "./hero-ui-store";

export const BANNER_UI_DEFAULTS = {
  enabled: false,
  overlayOpacity: 0.4,
  overlayColor: "#030712",
  gradientEnabled: true,
  gradientAngle: 90,
  gradientFrom: "rgba(3, 7, 18, 0.35)",
  gradientTo: "rgba(3, 7, 18, 0.15)",
  eyebrow: "Oferta",
  headline: "Novidades na loja",
  subline: "Confira no catálogo.",
  textAlign: "left" as HeroTextAlign,
  contentLeftPct: 8,
  contentTopPct: 35,
  eyebrowSizePx: 10,
  headlineSizePx: 28,
  sublineSizePx: 14,
  eyebrowColor: "hsl(var(--primary))",
  headlineColor: "hsl(var(--foreground))",
  headlineWeight: 700 as 400 | 500 | 600 | 700,
  sublineColor: "hsl(var(--muted-foreground))",
  ctaBackgroundColor: "hsl(var(--primary))",
  ctaForegroundColor: "hsl(var(--primary-foreground))",
  image: null as string | null,
  /** Imagem opcional para viewport estreita (Tailwind md); mesma proporção do recorte da desktop. */
  imageMobile: null as string | null,
  imageObjectPosition: "50% 45%",
};

export type BannerUiState = typeof BANNER_UI_DEFAULTS;

type BannerUiActions = {
  patch: (p: Partial<BannerUiState>) => void;
  reset: () => void;
  setBannerImage: (dataUrl: string | null) => void;
  setBannerImageMobile: (dataUrl: string | null) => void;
};

export const MAX_PERSIST_BANNER_IMAGE_CHARS = 180_000;

export const BANNER_JPEG_COMPRESS_MAX_BYTES = 125_000;

export function sliceBannerStateForPersist(s: BannerUiState & BannerUiActions) {
  const { patch, reset, setBannerImage, setBannerImageMobile, image, imageMobile, ...rest } = s;
  const cap = MAX_PERSIST_BANNER_IMAGE_CHARS;

  const keepDesktop = typeof image === "string" && image.length > 0 && image.length <= cap;
  const desktopTooBig = typeof image === "string" && image.length > cap;

  const keepMobile = typeof imageMobile === "string" && imageMobile.length > 0 && imageMobile.length <= cap;

  const persistedEnabled = desktopTooBig ? false : s.enabled;

  return {
    ...rest,
    image: keepDesktop ? image : null,
    imageMobile: keepMobile ? imageMobile : null,
    enabled: persistedEnabled,
  };
}

export const useBannerUiStore = create<BannerUiState & BannerUiActions>()(
  persist(
    (set) => ({
      ...BANNER_UI_DEFAULTS,
      patch: (p) => set((s) => ({ ...s, ...p })),
      reset: () => set({ ...BANNER_UI_DEFAULTS }),
      setBannerImage: (image) => set({ image }),
      setBannerImageMobile: (imageMobile) => set({ imageMobile }),
    }),
    {
      name: "rdc-banner-ui-v1",
      storage: createJSONStorage(() => createSafeLocalStorage() as Storage),
      partialize: (s) => sliceBannerStateForPersist(s),
    }
  )
);

const PERSIST_KEY = "rdc-banner-ui-v1";

export function flushBannerUiPersistence() {
  if (typeof window === "undefined") return;
  const slim = sliceBannerStateForPersist(useBannerUiStore.getState());
  try {
    window.localStorage.setItem(PERSIST_KEY, JSON.stringify({ state: slim, version: 0 }));
  } catch {
    /* noop */
  }
}
