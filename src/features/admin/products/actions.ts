"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser, getProfileForUser } from "@/lib/auth/server";

const productSchema = z.object({
  brand: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.coerce.number().positive(),
  category: z.string().min(1),
  image_url: z.string().min(1),
  sizes: z.string().optional(),
  colors: z.string().optional(),
  gallery_urls: z.string().optional(),
  is_featured: z.coerce.boolean().optional(),
  is_bestseller: z.coerce.boolean().optional(),
});

function splitComma(s: string | undefined): string[] {
  if (!s?.trim()) return [];
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function parseColorTokens(s: string | undefined): string[] {
  return splitComma(s).map((t) => {
    if (t.includes("|")) return t;
    return `${t}|#737373`;
  });
}

async function requireAdmin() {
  const user = await getSessionUser();
  if (!user) throw new Error("UNAUTHORIZED");
  const profile = await getProfileForUser(user.id);
  if (profile?.role !== "ADMIN") throw new Error("UNAUTHORIZED");
}

export async function createProduct(_: unknown, formData: FormData) {
  await requireAdmin();

  const featuredRaw = formData.get("is_featured");
  const bestsellerRaw = formData.get("is_bestseller");

  const parsed = productSchema.safeParse({
    brand: formData.get("brand"),
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    category: formData.get("category"),
    image_url: formData.get("image_url"),
    sizes: formData.get("sizes") ?? undefined,
    colors: formData.get("colors") ?? undefined,
    gallery_urls: formData.get("gallery_urls") ?? undefined,
    is_featured: featuredRaw === "on" || featuredRaw === "true",
    is_bestseller: bestsellerRaw === "on" || bestsellerRaw === "true",
  });

  if (!parsed.success) {
    return { ok: false as const, error: "Confira os campos." };
  }

  const gallery = splitComma(parsed.data.gallery_urls).filter((u) => u.startsWith("http"));

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .insert({
      brand: parsed.data.brand,
      name: parsed.data.name,
      description: parsed.data.description,
      price: parsed.data.price,
      category: parsed.data.category,
      image_url: parsed.data.image_url,
      gallery_urls: gallery,
      sizes: splitComma(parsed.data.sizes),
      colors: parseColorTokens(parsed.data.colors),
      is_featured: parsed.data.is_featured ?? false,
      is_bestseller: parsed.data.is_bestseller ?? false,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[admin] createProduct", error.message);
    return { ok: false as const, error: "Não foi possível salvar." };
  }

  return { ok: true as const, id: data.id as string };
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function updateProduct(id: string, _: unknown, formData: FormData) {
  await requireAdmin();

  const featuredRaw = formData.get("is_featured");
  const bestsellerRaw = formData.get("is_bestseller");

  const parsed = productSchema.safeParse({
    brand: formData.get("brand"),
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    category: formData.get("category"),
    image_url: formData.get("image_url"),
    sizes: formData.get("sizes") ?? undefined,
    colors: formData.get("colors") ?? undefined,
    gallery_urls: formData.get("gallery_urls") ?? undefined,
    is_featured: featuredRaw === "on" || featuredRaw === "true",
    is_bestseller: bestsellerRaw === "on" || bestsellerRaw === "true",
  });

  if (!parsed.success) {
    return { ok: false as const, error: "Confira os campos." };
  }

  const gallery = splitComma(parsed.data.gallery_urls).filter((u) => u.startsWith("http"));

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({
      brand: parsed.data.brand,
      name: parsed.data.name,
      description: parsed.data.description,
      price: parsed.data.price,
      category: parsed.data.category,
      image_url: parsed.data.image_url,
      gallery_urls: gallery,
      sizes: splitComma(parsed.data.sizes),
      colors: parseColorTokens(parsed.data.colors),
      is_featured: parsed.data.is_featured ?? false,
      is_bestseller: parsed.data.is_bestseller ?? false,
    })
    .eq("id", id);

  if (error) {
    console.error("[admin] updateProduct", error.message);
    return { ok: false as const, error: "Não foi possível atualizar." };
  }

  return { ok: true as const };
}
