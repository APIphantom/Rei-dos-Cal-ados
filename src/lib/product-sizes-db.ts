/** Codificação em `products.sizes[]`: `rótulo|quantidade` ou só `rótulo` (legado). */

export type ParsedSizeDb = { label: string; stock: number };

export function parseSizeDbToken(raw: string): ParsedSizeDb | null {
  const t = raw.trim();
  if (!t) return null;
  const parts = t.split("|").map((p) => p.trim());
  if (parts.length >= 2) {
    const label = parts[0] ?? "";
    const q = Number.parseInt(parts[1] ?? "0", 10);
    if (!label) return null;
    return { label, stock: Number.isFinite(q) ? Math.max(0, q) : 0 };
  }
  return { label: t, stock: 0 };
}

export function formatSizeDbToken(s: { label: string; stock: number }): string {
  const label = s.label.trim();
  const stock = Math.max(0, Math.floor(Number.isFinite(s.stock) ? s.stock : 0));
  return `${label}|${stock}`;
}

export function mergeLegacyStockIntoSizes<T extends { stock: number }>(
  sizes: T[],
  rowTotal: number
): T[] {
  if (sizes.length === 0) return sizes;
  const sum = sizes.reduce((s, x) => s + Math.max(0, x.stock), 0);
  if (sum > 0) return sizes;
  const t = Math.max(0, Math.floor(Number(rowTotal) || 0));
  if (t === 0) return sizes;
  const next = [...sizes];
  next[0] = { ...next[0], stock: t };
  return next;
}

export function sumSizeStocks(sizes: { stock: number }[]): number {
  return sizes.reduce((s, x) => s + Math.max(0, Math.floor(Number(x.stock) || 0)), 0);
}
