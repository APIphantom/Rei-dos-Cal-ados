import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Testimonial } from "@/types/testimonial";

export async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("testimonials")
      .select("id, author_name, body, display_order")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      console.warn("[testimonials]", error.message);
      return [];
    }
    return (data ?? []).map((r) => ({
      id: r.id as string,
      authorName: r.author_name as string,
      body: r.body as string,
      displayOrder: Number(r.display_order ?? 0),
    }));
  } catch {
    return [];
  }
}
