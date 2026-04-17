import type { Product } from "@/types/product";

export const WHATSAPP_NUMBER = "5511999999999";

/** Mensagem padrão do pedido: produto, tamanho e cor */
export function buildProductWhatsAppUrl(params: { product: Product; size: string; color: string }) {
  const { product, size, color } = params;
  const message = encodeURIComponent(
    `Olá, quero comprar ${product.name}, tamanho ${size}, cor ${color}`
  );
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
}

export function buildProductWhatsAppUrlQuick(product: Product) {
  const size = product.sizes[0] ?? "";
  const color = product.colors[0]?.name ?? "";
  if (!size || !color) {
    const message = encodeURIComponent(`Olá, quero saber mais sobre ${product.name}.`);
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
  }
  return buildProductWhatsAppUrl({ product, size, color });
}
