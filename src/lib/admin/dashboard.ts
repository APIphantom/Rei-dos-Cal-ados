import "server-only";

import { createClient } from "@/lib/supabase/server";

export type OrderRow = {
  id: string;
  customer_name: string;
  total: number;
  status: string;
  created_at: string;
};

export async function getRecentOrders(limit = 8): Promise<OrderRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id, customer_name, total, status, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.warn("[admin] getRecentOrders", error.message);
    return [];
  }
  return (data ?? []).map((o) => ({
    ...o,
    total: Number(o.total),
  })) as OrderRow[];
}

export async function getOrderStats(): Promise<{ count: number; revenue: number }> {
  const supabase = await createClient();
  const { count, error: countErr } = await supabase.from("orders").select("*", { count: "exact", head: true });
  if (countErr) {
    console.warn("[admin] getOrderStats count", countErr.message);
    return { count: 0, revenue: 0 };
  }
  const { data, error } = await supabase.from("orders").select("total");
  if (error) {
    return { count: count ?? 0, revenue: 0 };
  }
  const revenue = (data ?? []).reduce((s, r) => s + Number((r as { total: string }).total), 0);
  return { count: count ?? 0, revenue };
}
