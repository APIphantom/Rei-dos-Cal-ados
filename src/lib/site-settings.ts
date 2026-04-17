import "server-only";

import { createClient } from "@/lib/supabase/server";

export type HeroMediaType = "none" | "image" | "video";

export type HeroSettings = {
  type: HeroMediaType;
  url: string | null;
};

export async function getHeroSettings(): Promise<HeroSettings> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("hero_media_type, hero_media_url")
      .eq("id", "default")
      .maybeSingle();

    if (error || !data) {
      return { type: "none", url: null };
    }

    const t = data.hero_media_type as string;
    const url = data.hero_media_url as string | null;
    if ((t === "image" || t === "video") && url?.startsWith("http")) {
      return { type: t, url };
    }
    return { type: "none", url: null };
  } catch {
    return { type: "none", url: null };
  }
}
