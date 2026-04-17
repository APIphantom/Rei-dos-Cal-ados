"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser, getProfileForUser } from "@/lib/auth/server";
import type { HeroMediaType } from "@/lib/site-settings";

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
  if ((type === "image" || type === "video") && !url?.startsWith("http")) {
    return { ok: false, error: "Informe uma URL válida (https) ou envie um arquivo." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("site_settings").upsert(
    {
      id: "default",
      hero_media_type: type === "none" ? "none" : type,
      hero_media_url: type === "none" ? null : url,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (error) {
    console.error("[admin] saveHeroSettings", error.message);
    return { ok: false, error: "Não foi possível salvar. Rode a migração SQL (site_settings) no Supabase." };
  }

  return { ok: true };
}

export async function uploadHeroMedia(formData: FormData): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Não autorizado." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Selecione um arquivo." };
  }

  const supabase = await createClient();
  const ext = file.name.split(".").pop()?.toLowerCase();
  const safeExt = ext && /^[a-z0-9]+$/.test(ext) ? ext : "bin";
  const path = `hero/${Date.now()}-${crypto.randomUUID()}.${safeExt}`;

  const { error } = await supabase.storage.from("hero-media").upload(path, file, {
    contentType: file.type || "application/octet-stream",
    upsert: true,
  });

  if (error) {
    console.error("[admin] uploadHeroMedia", error.message);
    return { ok: false, error: error.message };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("hero-media").getPublicUrl(path);
  return { ok: true, url: publicUrl };
}
