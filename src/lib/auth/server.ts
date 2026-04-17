import "server-only";

import { createClient } from "@/lib/supabase/server";

export type ProfileRow = {
  full_name: string | null;
  role: "USER" | "ADMIN";
};

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function getProfileForUser(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return data as ProfileRow;
}

export async function getSessionWithProfile() {
  const user = await getSessionUser();
  if (!user) return { user: null, profile: null };
  const profile = await getProfileForUser(user.id);
  return { user, profile };
}
