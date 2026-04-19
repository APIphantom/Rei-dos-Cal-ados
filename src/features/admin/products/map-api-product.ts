import type { ProductPayload } from "@/features/admin/products/schema";
import { mergeLegacyStockIntoColors, parseColorDbToken, sumColorStocks } from "@/lib/product-colors-db";
import { mergeLegacyStockIntoSizes, parseSizeDbToken, sumSizeStocks } from "@/lib/product-sizes-db";

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

export function adminApiProductToPayload(row: AdminApiProductRow): Partial<ProductPayload> {
  const gallery = row.gallery_urls?.filter(Boolean) ?? [];
  const rowTotal = Math.max(0, Number(row.stock_quantity ?? 0));
  let colorObjs = (row.colors ?? [])
    .map(parseColorDbToken)
    .filter((c): c is NonNullable<typeof c> => c !== null);
  colorObjs = mergeLegacyStockIntoColors(colorObjs, rowTotal);
  let sizeObjs = (row.sizes ?? [])
    .map(parseSizeDbToken)
    .filter((s): s is NonNullable<typeof s> => s !== null);
  sizeObjs = mergeLegacyStockIntoSizes(sizeObjs, rowTotal);

  let stockQuantity = rowTotal;
  if (colorObjs.length > 0) {
    stockQuantity = sumColorStocks(colorObjs);
  } else if (sizeObjs.length > 0) {
    stockQuantity = sumSizeStocks(sizeObjs);
  }

  return {
    brand: row.brand,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    category: row.category,
    image_url: row.image_url,
    gallery_urls: gallery,
    tags: row.tags?.filter(Boolean) ?? [],
    sizes: sizeObjs,
    colors: colorObjs,
    is_featured: row.is_featured ?? false,
    is_bestseller: row.is_bestseller ?? false,
    stock_quantity: stockQuantity,
  };
}
