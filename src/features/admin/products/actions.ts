"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { mapStorageUploadError } from "@/lib/storage-errors";
import { getSessionUser, getProfileForUser } from "@/lib/auth/server";

function normalizeHex(raw: string): string {
  const t = raw.trim();
  if (!t) return "#888888";
  if (t.startsWith("#")) {
    if (t.length === 4) {
      const r = t[1] ?? "0";
      const g = t[2] ?? "0";
      const b = t[3] ?? "0";
      return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
    }
    return t.length >= 7 ? t.slice(0, 7).toUpperCase() : "#888888";
  }
  const only = t.replace(/[^0-9A-Fa-f]/g, "").slice(0, 6).padEnd(6, "0");
  return `#${only}`.toUpperCase();
}

export const productPayloadSchema = z.object({
  brand: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  category: z.string().min(1),
  image_url: z.string().min(1).refine((s) => /^https?:\/\//i.test(s), "URL da imagem inválida"),
  gallery_urls: z.array(z.string()).default([]),
  tags: z.array(z.string().min(1)).default([]),
  sizes: z.array(z.string()).default([]),
  colors: z
    .array(
      z.object({
        name: z.string().min(1),
        hex: z.string().min(1),
      })
    )
    .default([]),
  is_featured: z.boolean().default(false),
  is_bestseller: z.boolean().default(false),
  stock_quantity: z.number().int().min(0).default(0),
});

export type ProductPayload = z.infer<typeof productPayloadSchema>;

async function requireAdmin() {
  const user = await getSessionUser();
  if (!user) throw new Error("UNAUTHORIZED");
  const profile = await getProfileForUser(user.id);
  if (profile?.role !== "ADMIN") throw new Error("UNAUTHORIZED");
}

function colorsToDb(colors: ProductPayload["colors"]): string[] {
  return colors.map((c) => `${c.name.trim()}|${normalizeHex(c.hex)}`);
}

function galleryFromPayload(urls: string[], main: string): string[] {
  return urls.map((u) => u.trim()).filter((u) => u.startsWith("http") && u !== main);
}

export async function uploadProductImage(formData: FormData): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Não autorizado." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Selecione um arquivo de imagem." };
  }

  const supabase = await createClient();
  const ext = file.name.split(".").pop()?.toLowerCase();
  const safeExt = ext && /^[a-z0-9]+$/.test(ext) ? ext : "jpg";
  const path = `products/${Date.now()}-${crypto.randomUUID()}.${safeExt}`;

  const { error } = await supabase.storage.from("product-images").upload(path, file, {
    contentType: file.type || "image/jpeg",
    upsert: false,
  });

  if (error) {
    console.error("[admin] uploadProductImage", error.message);
    return { ok: false, error: mapStorageUploadError(error.message) };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("product-images").getPublicUrl(path);
  return { ok: true, url: publicUrl };
}

export async function createProductPayload(
  payload: unknown
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Não autorizado." };
  }

  const parsed = productPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, error: "Confira os campos obrigatórios." };
  }

  const p = parsed.data;
  const gallery = galleryFromPayload(p.gallery_urls, p.image_url);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .insert({
      brand: p.brand,
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.category,
      image_url: p.image_url,
      gallery_urls: gallery,
      tags: p.tags,
      sizes: p.sizes,
      colors: colorsToDb(p.colors),
      is_featured: p.is_featured,
      is_bestseller: p.is_bestseller,
      stock_quantity: p.stock_quantity,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[admin] createProductPayload", error.message);
    return { ok: false, error: "Não foi possível salvar o produto." };
  }

  return { ok: true, id: data.id as string };
}

export async function updateProductPayload(
  id: string,
  payload: unknown
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Não autorizado." };
  }

  const parsed = productPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, error: "Confira os campos obrigatórios." };
  }

  const p = parsed.data;
  const gallery = galleryFromPayload(p.gallery_urls, p.image_url);

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({
      brand: p.brand,
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.category,
      image_url: p.image_url,
      gallery_urls: gallery,
      tags: p.tags,
      sizes: p.sizes,
      colors: colorsToDb(p.colors),
      is_featured: p.is_featured,
      is_bestseller: p.is_bestseller,
      stock_quantity: p.stock_quantity,
    })
    .eq("id", id);

  if (error) {
    console.error("[admin] updateProductPayload", error.message);
    return { ok: false, error: "Não foi possível atualizar o produto." };
  }

  return { ok: true };
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
