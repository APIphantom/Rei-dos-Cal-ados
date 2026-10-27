"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { mapStorageUploadError } from "@/lib/storage-errors";
import { getSessionUser, getProfileForUser } from "@/lib/auth/server";
import type { HeroMediaType } from "@/lib/site-settings";
import { getHeroUploadDescriptor, isBundledHeroArtUrl, MAX_HERO_UPLOAD_BYTES } from "@/lib/hero-media";

const saveSchema = z.object({
  hero_media_type: z.enum(["none", "image", "video"]),
  hero_media_url: z.string().nullable(),
});

async function requireAdmin() {
  const user = await getSessionUser();
  if (!user) throw new Error("UNAUTHORIZED");
  const profile = await getProfileForUser(user.id);
  if (profile?.role !== "ADMIN") throw new Error("UNAUTHORIZED");
}

export async function saveHeroSettings(payload: unknown): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Não autorizado." };
  }

  const parsed = saveSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, error: "Dados inválidos." };
  }

  let url = parsed.data.hero_media_url?.trim() || null;
  const type = parsed.data.hero_media_type as HeroMediaType;

  if (type === "none") {
    url = null;
  }
  const isBundledHeroArt = type === "image" && isBundledHeroArtUrl(url);
  if ((type === "image" || type === "video") && !url?.startsWith("http") && !isBundledHeroArt) {
    return { ok: false, error: "Informe uma URL válida (https) ou envie um arquivo." };
  }

  const supabase = await createClient();
  const { data: cur } = await supabase.from("site_settings").select("*").eq("id", "default").maybeSingle();

  const { error } = await supabase.from("site_settings").upsert(
    {
      ...(cur ?? {}),
      id: "default",
      hero_media_type: type === "none" ? "none" : type,
      hero_media_url: type === "none" ? null : url,
      updated_at: new Date().toISOString(),
    } as Record<string, unknown>,
    { onConflict: "id" }
  );

  if (error) {
    console.error("[admin] saveHeroSettings", error.message);
    if (/row.level security|permission denied|unauthorized/i.test(error.message)) {
      return { ok: false, error: "Sua conta não tem permissão para salvar as configurações da loja." };
    }
    return { ok: false, error: "Não foi possível guardar as definições. Tente novamente." };
  }

  revalidatePath("/");
  return { ok: true };
}

const contactSchema = z.object({
  store_whatsapp_e164: z
    .string()
    .min(8)
    .transform((s) => s.replace(/\D/g, ""))
    .refine((d) => d.length >= 10 && d.length <= 15, "Informe o WhatsApp com DDD (ex.: 5511999999999)."),
  contact_email: z.union([z.string().email(), z.literal("")]).optional(),
  contact_phone: z.string().optional(),
  contact_city: z.string().optional(),
  instagram_url: z.union([z.string().url(), z.literal("")]).optional(),
  facebook_url: z.union([z.string().url(), z.literal("")]).optional(),
});

export async function saveStoreContactSettings(
  payload: unknown
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Não autorizado." };
  }

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, error: "Confira o WhatsApp e os links." };
  }

  const p = parsed.data;
  const supabase = await createClient();
  const { data: cur } = await supabase.from("site_settings").select("*").eq("id", "default").maybeSingle();

  const { error } = await supabase.from("site_settings").upsert(
    {
      ...(cur ?? {}),
      id: "default",
      store_whatsapp_e164: p.store_whatsapp_e164,
      contact_email: p.contact_email?.trim() || null,
      contact_phone: p.contact_phone?.trim() || null,
      contact_city: p.contact_city?.trim() || null,
      instagram_url: p.instagram_url?.trim() || null,
      facebook_url: p.facebook_url?.trim() || null,
      updated_at: new Date().toISOString(),
    } as Record<string, unknown>,
    { onConflict: "id" }
  );

  if (error) {
    console.error("[admin] saveStoreContactSettings", error.message);
    return { ok: false, error: "Não foi possível salvar o contato." };
  }

  return { ok: true };
}

export async function createHeroMediaUpload(
  payload: unknown
): Promise<{ ok: true; path: string; token: string; publicUrl: string } | { ok: false; error: string }> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Não autorizado." };
  }

  const parsed = z.object({ name: z.string().min(1), type: z.string(), size: z.number().int().positive() }).safeParse(payload);
  if (!parsed.success) {
    return { ok: false, error: "Selecione um arquivo válido." };
  }
  if (parsed.data.size > MAX_HERO_UPLOAD_BYTES) {
    return { ok: false, error: "O arquivo deve ter até 48 MB. Comprima-o e tente novamente." };
  }

  const descriptor = getHeroUploadDescriptor(parsed.data);
  if (!descriptor) {
    return { ok: false, error: "Formato não suportado. Use PNG, JPG, WebP ou AVIF, ou MP4, WebM e MOV." };
  }

  try {
    const supabase = await createClient();
    const path = `hero/${Date.now()}-${crypto.randomUUID()}.${descriptor.extension}`;
    const { data, error } = await supabase.storage.from("hero-media").createSignedUploadUrl(path, { upsert: false });

    if (error) {
      console.error("[admin] createHeroMediaUpload", error.message);
      return { ok: false, error: mapStorageUploadError(error.message) };
    }
    if (!data?.path || !data.token) {
      console.error("[admin] createHeroMediaUpload returned incomplete signed upload data");
      return { ok: false, error: "O armazenamento não devolveu uma autorização válida. Tente novamente." };
    }
    const { data: { publicUrl } } = supabase.storage.from("hero-media").getPublicUrl(data.path);
    return { ok: true, path: data.path, token: data.token, publicUrl };
  } catch (error) {
    console.error("[admin] createHeroMediaUpload", error);
    return { ok: false, error: "Não foi possível conectar ao armazenamento. Verifique a conexão e tente novamente." };
  }
}
