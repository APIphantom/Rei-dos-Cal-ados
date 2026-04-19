"use server";

import { z } from "zod";
import { createServiceRoleClient } from "@/lib/supabase/service";

const orderLineSchema = z.object({
  name: z.string(),
  brand: z.string(),
  size: z.string(),
  color: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number(),
  lineTotal: z.number(),
});

const createOrderSchema = z.object({
  customer_name: z.string().min(2),
  customer_phone: z.string().min(8),
  customer_address: z.string().min(5),
  total: z.number().positive(),
  lines: z.array(orderLineSchema).min(1),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export async function createOrderRecord(
  payload: unknown
): Promise<{ ok: true; id: string } | { ok: false; skipped: true; reason: string }> {
  const parsed = createOrderSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, skipped: true, reason: "Dados inválidos." };
  }

  const admin = createServiceRoleClient();
  if (!admin) {
    return { ok: false, skipped: true, reason: "Registo automático indisponível." };
  }

  const p = parsed.data;
  const items_json = p.lines.map((l) => ({
    name: l.name,
    brand: l.brand,
    size: l.size,
    color: l.color,
    quantity: l.quantity,
    unit_price: l.unitPrice,
    line_total: l.lineTotal,
  }));

  const { data, error } = await admin
    .from("orders")
    .insert({
      customer_name: p.customer_name.trim(),
      total: p.total,
      status: "Pendente",
      customer_phone: p.customer_phone.trim(),
      customer_address: p.customer_address.trim(),
      items_json,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[orders] createOrderRecord", error.message);
    return { ok: false, skipped: true, reason: "Não foi possível registar o pedido." };
  }

  return { ok: true, id: data.id as string };
}
