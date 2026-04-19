import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createSafeLocalStorage } from "@/lib/persist-storage-local";
import type { Testimonial } from "@/types/testimonial";

export type LocalTestimonialInput = {
  authorName: string;
  body: string;
  /** JPEG comprimido em data URL ou null (foto do cliente). */
  imageUrl: string | null;
  /** JPEG do produto comprado (data URL ou null). */
  productImageUrl: string | null;
};

const MAX_IMAGE_CHARS = 150_000;
const MAX_PRODUCT_IMAGE_CHARS = 200_000;

function clampItem(t: Testimonial): Testimonial {
  const img =
    typeof t.imageUrl === "string" && t.imageUrl.length > 0 && t.imageUrl.length <= MAX_IMAGE_CHARS
      ? t.imageUrl
      : null;
  const pimg =
    typeof t.productImageUrl === "string" &&
    t.productImageUrl.length > 0 &&
    t.productImageUrl.length <= MAX_PRODUCT_IMAGE_CHARS
      ? t.productImageUrl
      : null;
  return { ...t, imageUrl: img, productImageUrl: pimg };
}

function sliceForPersist(items: Testimonial[]): Testimonial[] {
  return items.map(clampItem);
}

type State = {
  items: Testimonial[];
  /** Substitui lista (útil para import futuro). */
  setItems: (items: Testimonial[]) => void;
  add: (input: LocalTestimonialInput) => void;
  remove: (id: string) => void;
  clear: () => void;
};

export const useTestimonialsLocalStore = create<State>()(
  persist(
    (set, get) => ({
      items: [],
      setItems: (items) => set({ items: sliceForPersist(items) }),
      add: (input) => {
        const id =
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `t-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const next: Testimonial = {
          id,
          authorName: input.authorName.trim(),
          body: input.body.trim(),
          displayOrder: get().items.length,
          imageUrl: input.imageUrl,
          productImageUrl: input.productImageUrl,
        };
        set({ items: [...get().items, clampItem(next)] });
      },
      remove: (id) => set({ items: get().items.filter((x) => x.id !== id) }),
      clear: () => set({ items: [] }),
    }),
    {
      name: "rdc-testimonials-v1",
      storage: createJSONStorage(() => createSafeLocalStorage() as Storage),
      partialize: (s) => ({ items: sliceForPersist(s.items) }),
      onRehydrateStorage: () => (state) => {
        if (state?.items?.length) {
          state.items = sliceForPersist(state.items);
        }
      },
    }
  )
);
