import type { Product } from "@/types/product";
import { DEFAULT_WHATSAPP_E164 } from "@/lib/store-defaults";

/** Monta URL wa.me com número E.164 (apenas dígitos, sem +). */
export function buildWaMeUrl(whatsappE164: string, message: string): string {
  const n = whatsappE164.replace(/\D/g, "") || DEFAULT_WHATSAPP_E164;
  return `https://wa.me/${n}?text=${encodeURIComponent(message)}`;
}

export function buildProductWhatsAppUrl(params: {
  product: Product;
  size: string;
  color: string;
  whatsappE164?: string;
}) {
  const { product, size, color } = params;
  const n = params.whatsappE164?.replace(/\D/g, "") || DEFAULT_WHATSAPP_E164;
  const message = `Olá, quero comprar ${product.name}, tamanho ${size}, cor ${color}`;
  return buildWaMeUrl(n, message);
}

export function buildProductWhatsAppUrlQuick(product: Product, whatsappE164?: string) {
  const size = product.sizes[0] ?? "";
  const color = product.colors[0]?.name ?? "";
  const n = whatsappE164?.replace(/\D/g, "") || DEFAULT_WHATSAPP_E164;
  if (!size || !color) {
    return buildWaMeUrl(n, `Olá, quero saber mais sobre ${product.name}.`);
  }
  return buildProductWhatsAppUrl({ product, size, color, whatsappE164: n });
}
