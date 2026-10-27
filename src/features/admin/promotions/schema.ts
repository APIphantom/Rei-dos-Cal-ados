import { z } from "zod";

const safeHref = z
  .string()
  .trim()
  .min(1, "Informe o destino do botão.")
  .max(500)
  .refine((value) => value.startsWith("/") && !value.startsWith("//") || /^https:\/\//i.test(value), {
    message: "Use um caminho da loja ou uma URL https.",
  });

export const promotionSchema = z.object({
  id: z.string().uuid().optional(),
  offer_type: z.enum(["campaign", "kit"]),
  title: z.string().trim().min(1, "Informe o título.").max(120),
  short_text: z.string().trim().min(1, "Informe o texto curto.").max(240),
  commercial_text: z.string().trim().max(240).nullable().optional(),
  image_url: z.string().trim().url("Informe uma imagem válida."),
  image_alt: z.string().trim().max(160).default(""),
  product_id: z.string().uuid().nullable().optional(),
  cta_label: z.string().trim().min(1, "Informe o texto do botão.").max(48),
  cta_href: safeHref,
  is_active: z.boolean(),
  sort_order: z.number().int().min(0).max(9999),
});

export type PromotionPayload = z.infer<typeof promotionSchema>;
