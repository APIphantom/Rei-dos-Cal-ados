import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Promotion } from "@/types/promotion";

type PromotionRow = {
  id: string;
  offer_type: "campaign" | "kit";
  title: string;
  short_text: string;
  commercial_text: string | null;
  image_url: string;
  image_alt: string;
  product_id: string | null;
  cta_label: string;
  cta_href: string;
  is_active: boolean;
  sort_order: number;
};

export function mapPromotionRow(row: PromotionRow): Promotion {
  return {
    id: row.id,
    offerType: row.offer_type,
    title: row.title,
    shortText: row.short_text,
    commercialText: row.commercial_text,
    imageUrl: row.image_url,
    imageAlt: row.image_alt,
    productId: row.product_id,
    ctaLabel: row.cta_label,
    ctaHref: row.cta_href,
    isActive: row.is_active,
    sortOrder: row.sort_order,
  };
}

export async function getActivePromotions(): Promise<Promotion[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("promotions")
      .select("id, offer_type, title, short_text, commercial_text, image_url, image_alt, product_id, cta_label, cta_href, is_active, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      if (!/promotions|schema cache|does not exist/i.test(error.message)) {
        console.error("[promotions] getActivePromotions", error.message);
      }
      return [];
    }

    return (data as PromotionRow[]).map(mapPromotionRow);
  } catch (error) {
    console.error("[promotions] getActivePromotions", error);
    return [];
  }
}

export async function getAllPromotions(): Promise<Promotion[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("promotions")
      .select("id, offer_type, title, short_text, commercial_text, image_url, image_alt, product_id, cta_label, cta_href, is_active, sort_order")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[promotions] getAllPromotions", error.message);
      return [];
    }
    return (data as PromotionRow[]).map(mapPromotionRow);
  } catch (error) {
    console.error("[promotions] getAllPromotions", error);
    return [];
  }
}
