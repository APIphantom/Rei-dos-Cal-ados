/** Marcador quando não há tamanho/cor na linha (produto sem variantes). */
export const CART_VARIANT_PLACEHOLDER = "—";

/** `true` se o valor é um tamanho/cor real na linha do carrinho. */
export function isCartVariantSet(v: string): boolean {
  const t = v.trim();
  return Boolean(t && t !== CART_VARIANT_PLACEHOLDER);
}

function isSet(v: string): boolean {
  return isCartVariantSet(v);
}

/** Uma linha para o carrinho/checkout: só mostra o que existe (ex.: «Tam. 42 · Preto»). */
export function formatCartVariantLabel(size: string, color: string): string {
  const parts: string[] = [];
  if (isSet(size)) parts.push(`Tam. ${size.trim()}`);
  if (isSet(color)) parts.push(color.trim());
  return parts.join(" · ");
}

/** Fragmentos para texto de pedido/WhatsApp («tam 42», «cor Preto»). */
export function orderLineVariantFragments(size: string, color: string): string[] {
  const out: string[] = [];
  if (isSet(size)) out.push(`tam ${size.trim()}`);
  if (isSet(color)) out.push(`cor ${color.trim()}`);
  return out;
}
