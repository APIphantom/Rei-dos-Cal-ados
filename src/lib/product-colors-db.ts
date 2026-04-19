/** Codificação em `products.colors[]`: `nome|#hex|quantidade` (terceiro segmento opcional em dados antigos). */

export type ParsedColorDb = { name: string; hex: string; stock: number };

export function normalizeHex(raw: string): string {
  const t = raw.trim();
  if (!t) return "#888888";
  if (t.startsWith("#")) {
    if (t.length === 4) {
      const r = t[1] ?? "0";
      const g = t[2] ?? "0";
      const b = t[3] ?? "0";
      return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
    }
    return t.length >= 7 ? t.slice(0, 7).toUpperCase() : "#888888";
  }
  const only = t.replace(/[^0-9A-Fa-f]/g, "").slice(0, 6).padEnd(6, "0");
  return `#${only}`.toUpperCase();
}

export function parseColorDbToken(raw: string): ParsedColorDb | null {
  const t = raw.trim();
  if (!t) return null;
  const parts = t.split("|").map((p) => p.trim());
  if (parts.length >= 3) {
    const name = parts[0] ?? "";
    let hex = parts[1] ?? "#111111";
    const q = Number.parseInt(parts[2] ?? "0", 10);
    if (!name) return null;
    if (!hex.startsWith("#")) hex = `#${hex}`;
    return {
      name,
      hex,
      stock: Number.isFinite(q) ? Math.max(0, q) : 0,
    };
  }
  if (parts.length >= 2) {
    const name = parts[0]?.trim() ?? "";
    let hex = parts[1]?.trim() ?? "#111111";
    if (!name) return null;
    if (!hex.startsWith("#")) hex = `#${hex}`;
    return { name, hex, stock: 0 };
  }
  return { name: t, hex: "#737373", stock: 0 };
}

export function formatColorDbToken(c: { name: string; hex: string; stock: number }): string {
  const name = c.name.trim();
  const hex = normalizeHex(c.hex);
  const stock = Math.max(0, Math.floor(Number.isFinite(c.stock) ? c.stock : 0));
  return `${name}|${hex}|${stock}`;
}

/** Se não há quantidade por cor no token mas existe `stock_quantity` na linha, atribui o total à primeira cor. */
export function mergeLegacyStockIntoColors<T extends { stock: number }>(
  colors: T[],
  rowTotal: number
): T[] {
  if (colors.length === 0) return colors;
  const sum = colors.reduce((s, c) => s + Math.max(0, c.stock), 0);
  if (sum > 0) return colors;
  const t = Math.max(0, Math.floor(Number(rowTotal) || 0));
  if (t === 0) return colors;
  const next = [...colors];
  next[0] = { ...next[0], stock: t };
  return next;
}

export function sumColorStocks(colors: { stock: number }[]): number {
  return colors.reduce((s, c) => s + Math.max(0, Math.floor(Number(c.stock) || 0)), 0);
}
