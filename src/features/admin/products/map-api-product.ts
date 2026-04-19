import type { ProductPayload } from "@/features/admin/products/schema";

/** Resposta de GET /api/admin/products/[id] — linha crua do Supabase */
export type AdminApiProductRow = {
  id: string;
  brand: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  gallery_urls: string[] | null;
  category: string;
  sizes: string[] | null;
  colors: string[] | null;
  tags: string[] | null;
  is_featured: boolean | null;
  is_bestseller: boolean | null;
  stock_quantity: number | null;
};

function parseColorToken(raw: string): { name: string; hex: string } | null {
  const t = raw.trim();
  if (!t) return null;
  const parts = t.split("|");
  if (parts.length >= 2) {
    const name = parts[0]?.trim() ?? "";
    let hex = parts[1]?.trim() ?? "#111111";
    if (!name) return null;
    if (!hex.startsWith("#")) hex = `#${hex}`;
    return { name, hex };
  }
  return { name: t, hex: "#737373" };
}

export function adminApiProductToPayload(row: AdminApiProductRow): Partial<ProductPayload> {
  const gallery = row.gallery_urls?.filter(Boolean) ?? [];
  const colorObjs = (row.colors ?? []).map(parseColorToken).filter((c): c is NonNullable<typeof c> => c !== null);

  return {
    brand: row.brand,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    category: row.category,
    image_url: row.image_url,
    gallery_urls: gallery,
    tags: row.tags?.filter(Boolean) ?? [],
    sizes: row.sizes ?? [],
    colors: colorObjs,
    is_featured: row.is_featured ?? false,
    is_bestseller: row.is_bestseller ?? false,
    stock_quantity: Math.max(0, Number(row.stock_quantity ?? 0)),
  };
}
