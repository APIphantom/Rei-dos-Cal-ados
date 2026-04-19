"use server";

import { createClient } from "@/lib/supabase/server";
import { mapStorageUploadError } from "@/lib/storage-errors";
import { getSessionUser, getProfileForUser } from "@/lib/auth/server";
import { getPayloadErrorMessage, productPayloadSchema, type ProductPayload } from "@/features/admin/products/schema";

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

  const mime = (file.type || "").toLowerCase();
  const allowedMime = new Set([
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "image/avif",
  ]);
  const extLower = file.name.split(".").pop()?.toLowerCase() ?? "";
  const allowedExt = new Set(["png", "jpg", "jpeg", "webp", "avif"]);
  const mimeOk = mime && allowedMime.has(mime);
  const extOk = allowedExt.has(extLower);
  if (!mimeOk && !extOk) {
    return {
      ok: false,
      error: "Formato não suportado. Use PNG, JPG, WebP ou AVIF.",
    };
  }

  const supabase = await createClient();
  const safeExt = extLower && /^[a-z0-9]+$/.test(extLower) ? extLower : "jpg";
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
    return { ok: false, error: getPayloadErrorMessage(parsed.error) };
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
    return { ok: false, error: getPayloadErrorMessage(parsed.error) };
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
