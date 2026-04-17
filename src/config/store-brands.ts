/**
 * Marcas oficiais da loja (filtro do catálogo + vitrine).
 * Logos: Simple Icons (CDN) + Kenner em /public/brands/kenner.svg
 */
export type StoreBrand = {
  name: string;
  logoUrl: string;
};

/** Simple Icons (SVG monocromático, fundo branco no carrossel). */
const SIMPLE = "https://unpkg.com/simple-icons@11.11.0/icons";

export const STORE_BRANDS: StoreBrand[] = [
  { name: "Nike", logoUrl: `${SIMPLE}/nike.svg` },
  { name: "Adidas", logoUrl: `${SIMPLE}/adidas.svg` },
  { name: "Vans", logoUrl: `${SIMPLE}/vans.svg` },
  { name: "Puma", logoUrl: `${SIMPLE}/puma.svg` },
  { name: "Converse", logoUrl: `${SIMPLE}/converse.svg` },
  { name: "New Balance", logoUrl: `${SIMPLE}/newbalance.svg` },
  { name: "Kenner", logoUrl: "/brands/kenner.svg" },
  { name: "Crocs", logoUrl: `${SIMPLE}/crocs.svg` },
];

export const STORE_BRAND_NAMES = STORE_BRANDS.map((b) => b.name);

/** Sugestões para o campo "tipo" no admin (ex-tipo categoria de produto). */
export const PRODUCT_TYPE_SUGGESTIONS = ["Tênis", "Sandália", "Chinelo", "Bota", "Slide", "Mocassim"];

export function normalizeBrandKey(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Compara marcas ignorando maiúsculas e espaços extras. */
export function brandsMatch(a: string, b: string): boolean {
  return normalizeBrandKey(a) === normalizeBrandKey(b);
}
