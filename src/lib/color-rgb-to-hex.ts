/** Converte o valor computado `rgb()` / `rgba()` em #rrggbb (alpha ignorado). */
export function rgbCssStringToHex(css: string): string | null {
  const m = css.trim().match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i);
  if (!m) return null;
  const r = Math.min(255, Math.max(0, Math.round(Number(m[1]))));
  const g = Math.min(255, Math.max(0, Math.round(Number(m[2]))));
  const b = Math.min(255, Math.max(0, Math.round(Number(m[3]))));
  return (
    "#" +
    [r, g, b]
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}
