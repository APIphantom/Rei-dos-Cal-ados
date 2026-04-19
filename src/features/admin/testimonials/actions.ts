"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser, getProfileForUser } from "@/lib/auth/server";

async function requireAdmin() {
  const user = await getSessionUser();
  if (!user) throw new Error("UNAUTHORIZED");
  const profile = await getProfileForUser(user.id);
  if (profile?.role !== "ADMIN") throw new Error("UNAUTHORIZED");
}

const rowSchema = z.object({
  author_name: z.string().min(1),
  body: z.string().min(1),
  display_order: z.number().int().min(0).default(0),
});

export async function saveTestimonial(
  payload: unknown
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Não autorizado." };
  }
  const parsed = rowSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, error: "Preencha nome e texto." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("testimonials")
    .insert({
      author_name: parsed.data.author_name.trim(),
      body: parsed.data.body.trim(),
      display_order: parsed.data.display_order,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[admin] saveTestimonial", error.message);
    return { ok: false, error: "Não foi possível guardar. Tente novamente." };
  }
  return { ok: true, id: data.id as string };
}

export async function deleteTestimonial(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Não autorizado." };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("testimonials").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
