"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser, getProfileForUser } from "@/lib/auth/server";
import { mapStorageUploadError } from "@/lib/storage-errors";
import { promotionSchema } from "@/features/admin/promotions/schema";

async function requireAdmin() {
  const user = await getSessionUser();
  if (!user) throw new Error("UNAUTHORIZED");
  const profile = await getProfileForUser(user.id);
  if (profile?.role !== "ADMIN") throw new Error("UNAUTHORIZED");
}

export async function savePromotion(
  payload: unknown
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Não autorizado." };
  }

  const parsed = promotionSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Confira os campos da promoção." };
  }

  const p = parsed.data;
  const values = {
    offer_type: p.offer_type,
    title: p.title,
    short_text: p.short_text,
    commercial_text: p.commercial_text?.trim() || null,
    image_url: p.image_url,
    image_alt: p.image_alt,
    product_id: p.product_id || null,
    cta_label: p.cta_label,
    cta_href: p.cta_href,
    is_active: p.is_active,
    sort_order: p.sort_order,
    updated_at: new Date().toISOString(),
  };

  const supabase = await createClient();
  if (p.id) {
    const { data, error } = await supabase
      .from("promotions")
      .update(values)
      .eq("id", p.id)
      .select("id")
      .maybeSingle();
    if (error || !data) {
      console.error("[admin] savePromotion", error?.message ?? "promotion not found");
      return { ok: false, error: "Não foi possível atualizar a promoção." };
    }
    revalidatePath("/");
    revalidatePath("/admin/promotions");
    return { ok: true, id: data.id as string };
  }

  const { data, error } = await supabase.from("promotions").insert(values).select("id").single();
  if (error || !data) {
    console.error("[admin] savePromotion", error?.message ?? "insert returned no row");
    return { ok: false, error: "Não foi possível criar a promoção." };
  }
  revalidatePath("/");
  revalidatePath("/admin/promotions");
  return { ok: true, id: data.id as string };
}

export async function deletePromotion(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Não autorizado." };
  }
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { ok: false, error: "Promoção inválida." };

  const supabase = await createClient();
  const { error } = await supabase.from("promotions").delete().eq("id", id);
  if (error) {
    console.error("[admin] deletePromotion", error.message);
    return { ok: false, error: "Não foi possível excluir a promoção." };
  }
  revalidatePath("/");
  revalidatePath("/admin/promotions");
  return { ok: true };
}

export async function uploadPromotionImage(
  formData: FormData
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Não autorizado." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Selecione uma imagem." };
  if (file.size > 8 * 1024 * 1024) return { ok: false, error: "A imagem deve ter até 8 MB." };

  const extensions: Record<string, string> = {
    "image/avif": "avif",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  const extension = extensions[file.type.toLowerCase()];
  if (!extension) return { ok: false, error: "Use uma imagem PNG, JPG, WebP ou AVIF." };

  const supabase = await createClient();
  const path = `promotions/${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("product-images").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) {
    console.error("[admin] uploadPromotionImage", error.message);
    return { ok: false, error: mapStorageUploadError(error.message) };
  }

  const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(path);
  return { ok: true, url: publicUrl };
}
