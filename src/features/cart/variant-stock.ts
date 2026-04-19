import type { Product } from "@/types/product";
import { isCartVariantSet } from "@/features/cart/variant-label";
import type { CartLine } from "@/features/cart/types";

/**
 * Stock máximo para a linha do carrinho — mesma regra que a ficha:
 * com cores → stock da cor; só tamanhos → stock do tamanho; sem variantes → `stockQuantity`.
 */
export function maxQtyForCartLine(product: Product, size: string, color: string): number {
  const hasSizes = product.sizes.length > 0;
  const hasColors = product.colors.length > 0;
  const noVariants = !hasSizes && !hasColors;

  const sizeLabel = isCartVariantSet(size) ? size.trim() : "";
  const colorName = isCartVariantSet(color) ? color.trim() : "";

  if (noVariants) {
    return Math.max(0, Math.floor(Number(product.stockQuantity) || 0));
  }
  if (hasColors && !colorName) return 0;
  if (hasSizes && !sizeLabel) return 0;
  if (hasColors && colorName) {
    const c = product.colors.find((x) => x.name === colorName);
    return Math.max(0, Math.floor(Number(c?.stock) || 0));
  }
  if (!hasColors && hasSizes && sizeLabel) {
    const z = product.sizes.find((x) => x.label === sizeLabel);
    return Math.max(0, Math.floor(Number(z?.stock) || 0));
  }
  return Math.max(0, Math.floor(Number(product.stockQuantity) || 0));
}

/** Corta quantidades ao stock da variação e remove linhas sem stock ou inválidas (ex.: após reidratar o carrinho). */
export function sanitizeCartLines(lines: CartLine[]): CartLine[] {
  const out: CartLine[] = [];
  for (const line of lines) {
    if (!line?.product?.id) continue;
    const raw = Math.max(0, Math.floor(Number(line.quantity) || 0));
    if (raw <= 0) continue;
    const max = maxQtyForCartLine(line.product, line.size, line.color);
    if (max <= 0) continue;
    const quantity = Math.min(raw, max);
    if (quantity <= 0) continue;
    out.push({ ...line, quantity });
  }
  return out;
}
