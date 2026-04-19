import { z } from "zod";

export const productPayloadSchema = z.object({
  brand: z.string().trim().min(1, "Informe a marca."),
  name: z.string().trim().min(1, "Informe o nome do produto."),
  description: z.string().trim().min(1, "Adicione uma descrição do produto."),
  price: z.number().positive("Informe um preço maior que zero."),
  category: z.string().trim().min(1, "Informe a categoria."),
  image_url: z.string().min(1).refine((s) => /^https?:\/\//i.test(s), "URL da imagem inválida"),
  gallery_urls: z.array(z.string()).default([]),
  tags: z.array(z.string().min(1)).default([]),
  sizes: z
    .array(
      z.object({
        label: z.string().min(1),
        stock: z.number().int().min(0).default(0),
      })
    )
    .default([]),
  colors: z
    .array(
      z.object({
        name: z.string().min(1),
        hex: z.string().min(1),
        stock: z.number().int().min(0).default(0),
      })
    )
    .default([]),
  is_featured: z.boolean().default(false),
  is_bestseller: z.boolean().default(false),
  stock_quantity: z.number().int().min(0).default(0),
});

export type ProductPayload = z.infer<typeof productPayloadSchema>;

export function getPayloadErrorMessage(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) return "Confira os campos obrigatórios.";
  return issue.message || "Confira os campos obrigatórios.";
}

