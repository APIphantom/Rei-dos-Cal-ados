import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Product, ProductColor } from "@/types/product";

export type ProductRow = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  gallery_urls: string[] | null;
  category: string;
  brand: string;
  sizes: string[] | null;
  colors: string[] | null;
  tags: string[] | null;
  is_featured: boolean | null;
  is_bestseller: boolean | null;
  stock_quantity?: number | null;
  created_at: string;
};

function parseColorToken(raw: string): ProductColor | null {
  const t = raw.trim();
  if (!t) return null;
  const parts = t.split("|");
  if (parts.length >= 2) {
    const name = parts[0]?.trim() ?? "";
    const hex = parts[1]?.trim() ?? "#888888";
    if (!name) return null;
    return { name, hex: hex.startsWith("#") ? hex : `#${hex}` };
  }
  return { name: t, hex: "#737373" };
}

function mapColors(arr: string[] | null): ProductColor[] {
  if (!arr?.length) return [];
  return arr.map(parseColorToken).filter((c): c is ProductColor => c !== null);
}

export function mapRow(row: ProductRow): Product {
  const gallery = row.gallery_urls?.filter(Boolean) ?? [];
  const images = gallery.length > 0 ? [row.image_url, ...gallery] : [row.image_url];
  return {
    id: row.id,
    name: row.name,
    model: row.name,
    description: row.description,
    price: Number(row.price),
    imageUrl: row.image_url,
    images,
    sizes: row.sizes ?? [],
    colors: mapColors(row.colors),
    category: row.category,
    brand: row.brand,
    tags: row.tags?.filter(Boolean) ?? [],
    isFeatured: row.is_featured ?? false,
    isBestseller: row.is_bestseller ?? false,
    stockQuantity: Math.max(0, Number(row.stock_quantity ?? 0)),
  };
}

function configured() {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.length &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length
  );
}

export async function getAllProducts(): Promise<Product[]> {
  if (!configured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[produtos] getAllProducts", error.message);
    if (error.message.includes("schema cache") || error.message.includes("does not exist")) {
      console.error("[produtos] Tabela de produtos indisponível.");
    }
    return [];
  }
  return (data as ProductRow[]).map(mapRow);
}

export async function getProductById(id: string): Promise<Product | null> {
  if (!configured()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  if (error) {
    console.error("[produtos] getProductById", error.message);
    return null;
  }
  if (!data) return null;
  return mapRow(data as ProductRow);
}

export async function getFeaturedProduct(): Promise<Product | null> {
  if (!configured()) return null;
  const supabase = await createClient();
  const { data: featured } = await supabase
    .from("products")
    .select("*")
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (featured) return mapRow(featured as ProductRow);

  const { data: latest } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return latest ? mapRow(latest as ProductRow) : null;
}

export async function getRelatedProducts(category: string, excludeId: string, limit = 4): Promise<Product[]> {
  if (!configured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category", category)
    .neq("id", excludeId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("[produtos] getRelatedProducts", error.message);
    return [];
  }
  return (data as ProductRow[]).map(mapRow);
}

export async function getDistinctBrands(): Promise<string[]> {
  const products = await getAllProducts();
  return Array.from(new Set(products.map((p) => p.brand))).sort((a, b) => a.localeCompare(b, "pt-BR"));
}

