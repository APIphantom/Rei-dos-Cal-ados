/**
 * Marcas oficiais da loja (filtro do catálogo + vitrine).
 * Logos: Simple Icons (CDN) + locais em /public/brands/ (Kenner, Converse, Vans, Crocs)
 */
export type StoreBrand = {
  name: string;
  logoUrl: string;
};

/** Simple Icons (SVG monocromático) — jsDelivr costuma ser mais estável que unpkg. */
const SIMPLE = "https://cdn.jsdelivr.net/npm/simple-icons@11.11.0/icons";

export const STORE_BRANDS: StoreBrand[] = [
  { name: "Nike", logoUrl: `${SIMPLE}/nike.svg` },
  { name: "Adidas", logoUrl: `${SIMPLE}/adidas.svg` },
  { name: "Vans", logoUrl: "/brands/vans.svg" },
  { name: "Puma", logoUrl: `${SIMPLE}/puma.svg` },
  /** Wordmark Converse (SVG local); nome comercial All Star. */
  { name: "All Star (Chuck Taylor)", logoUrl: "/brands/converse.svg" },
  { name: "New Balance", logoUrl: `${SIMPLE}/newbalance.svg` },
  { name: "Kenner", logoUrl: "/brands/kenner.svg" },
  { name: "Crocs", logoUrl: "/brands/crocs.svg" },
];

export const STORE_BRAND_NAMES = STORE_BRANDS.map((b) => b.name);

/** Sugestões para o campo "tipo" no admin (ex-tipo categoria de produto). */
export const PRODUCT_TYPE_SUGGESTIONS = ["Tênis", "Sandália", "Chinelo", "Bota", "Slide", "Mocassim"];

export function normalizeBrandKey(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

const LEGACY_CONVERSE = normalizeBrandKey("Converse");
const ALL_STAR = normalizeBrandKey("All Star (Chuck Taylor)");

/** Compara marcas ignorando maiúsculas e espaços extras. Une Converse ↔ All Star. */
export function brandsMatch(a: string, b: string): boolean {
  const na = normalizeBrandKey(a);
  const nb = normalizeBrandKey(b);
  if (na === nb) return true;
  const pairConverse =
    (na === LEGACY_CONVERSE || na === ALL_STAR) && (nb === LEGACY_CONVERSE || nb === ALL_STAR);
  return pairConverse;
}
