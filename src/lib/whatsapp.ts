import type { Product } from "@/types/product";
import { DEFAULT_WHATSAPP_E164 } from "@/lib/store-defaults";

/** Monta URL wa.me com número E.164 (apenas dígitos, sem +). */
export function buildWaMeUrl(whatsappE164: string, message: string): string {
  const n = whatsappE164.replace(/\D/g, "") || DEFAULT_WHATSAPP_E164;
  return `https://wa.me/${n}?text=${encodeURIComponent(message)}`;
}

export function buildProductWhatsAppUrl(params: {
  product: Product;
  size?: string;
  color?: string;
  whatsappE164?: string;
}) {
  const { product } = params;
  const size = params.size?.trim();
  const color = params.color?.trim();
  const bits: string[] = [];
  if (size && size !== "—") bits.push(`tamanho ${size}`);
  if (color && color !== "—") bits.push(`cor ${color}`);
  const suffix = bits.length ? ` (${bits.join(", ")})` : "";
  const message = `Olá, quero comprar ${product.name}${suffix}.`;
  const n = params.whatsappE164?.replace(/\D/g, "") || DEFAULT_WHATSAPP_E164;
  return buildWaMeUrl(n, message);
}

/** Mensagem para produto sem tamanhos nem cores na ficha — encomenda genérica */
export function buildProductEncomendaUrl(product: Product, whatsappE164?: string) {
  const n = whatsappE164?.replace(/\D/g, "") || DEFAULT_WHATSAPP_E164;
  return buildWaMeUrl(n, `Olá, quero encomendar o produto: ${product.name}.`);
}

export function buildProductWhatsAppUrlQuick(product: Product, whatsappE164?: string) {
  const sz = product.sizes[0]?.label ?? "";
  const col = product.colors[0]?.name ?? "";
  const n = whatsappE164?.replace(/\D/g, "") || DEFAULT_WHATSAPP_E164;
  if (!sz && !col) {
    return buildWaMeUrl(n, `Olá, quero saber mais sobre ${product.name}.`);
  }
  return buildProductWhatsAppUrl({ product, size: sz || undefined, color: col || undefined, whatsappE164: n });
}
