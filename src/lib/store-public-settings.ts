import "server-only";

import { createClient } from "@/lib/supabase/server";
import { DEFAULT_WHATSAPP_E164 } from "@/lib/store-defaults";

export { DEFAULT_WHATSAPP_E164 } from "@/lib/store-defaults";

export type StorePublicSettings = {
  whatsappE164: string;
  contactEmail: string | null;
  contactPhone: string | null;
  contactCity: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
};

const empty: StorePublicSettings = {
  whatsappE164: DEFAULT_WHATSAPP_E164,
  contactEmail: null,
  contactPhone: null,
  contactCity: null,
  instagramUrl: null,
  facebookUrl: null,
};

export async function getStorePublicSettings(): Promise<StorePublicSettings> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select(
        "store_whatsapp_e164, contact_email, contact_phone, contact_city, instagram_url, facebook_url"
      )
      .eq("id", "default")
      .maybeSingle();

    if (error || !data) return empty;

    const row = data as Record<string, string | null>;
    const wa = row.store_whatsapp_e164?.replace(/\D/g, "") || DEFAULT_WHATSAPP_E164;
    return {
      whatsappE164: wa.length >= 10 ? wa : DEFAULT_WHATSAPP_E164,
      contactEmail: row.contact_email?.trim() || null,
      contactPhone: row.contact_phone?.trim() || null,
      contactCity: row.contact_city?.trim() || null,
      instagramUrl: row.instagram_url?.trim() || null,
      facebookUrl: row.facebook_url?.trim() || null,
    };
  } catch {
    return empty;
  }
}
