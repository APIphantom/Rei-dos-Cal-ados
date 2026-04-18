"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { rgbCssStringToHex } from "@/lib/color-rgb-to-hex";
import { cn } from "@/lib/utils";

function normalizeHexInput(raw: string): string | null {
  const t = raw.trim();
  if (/^#[0-9A-Fa-f]{3}$|^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{8}$/.test(t)) {
    if (t.length === 4) {
      const r = t[1],
        g = t[2],
        b = t[3];
      return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
    }
    return t.length === 9 ? t.slice(0, 7).toUpperCase() : t.toUpperCase();
  }
  return null;
}

type Props = {
  label: string;
  value: string;
  onChange: (next: string) => void;
  /** Valor com token do tema (hsl(var(--…))) para o botão restaurar */
  themeDefault?: string;
  description?: string;
};

/**
 * Seletor de cor que funciona com `#hex`, `hsl(var(--x))` e strings que o browser resolve em `color`.
 * O `<input type="color">` usa o RGB computado do valor atual; alterações gravam sempre em `#RRGGBB`.
 */
export function ThemeColorField({ label, value, onChange, themeDefault, description }: Props) {
  const probeRef = useRef<HTMLSpanElement>(null);
  const [pickerHex, setPickerHex] = useState("#FFFFFF");

  useLayoutEffect(() => {
    const el = probeRef.current;
    if (!el) return;
    const rgb = getComputedStyle(el).color;
    const hex = rgbCssStringToHex(rgb);
    if (hex) setPickerHex(hex);
  }, [value]);

  const canRestoreTheme = Boolean(themeDefault) && value.trim() !== (themeDefault ?? "").trim();

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</p>
      {description ? <p className="mt-1 text-[11px] text-zinc-600">{description}</p> : null}
      {/* Elemento escondido para resolver hsl(var(--*)) no contexto do tema */}
      <span
        ref={probeRef}
        className="pointer-events-none fixed -left-[9999px] top-0 text-[1px]"
        style={{ color: value?.trim() ? value : "#888888" }}
        aria-hidden
      />

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <input
          type="color"
          value={pickerHex}
          onChange={(e) => {
            const hex = normalizeHexInput(e.target.value);
            if (hex) onChange(hex);
          }}
          className="h-10 w-14 shrink-0 cursor-pointer rounded border border-[#2a2a2a] bg-[#111] p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-md"
          title="Escolher cor"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-w-0 flex-1 rounded-xl border border-[#2a2a2a] bg-[#111] px-3 py-2 font-mono text-xs outline-none focus:border-[#F59E0B]/50 md:text-sm"
          placeholder="#FFFFFF ou hsl(var(--primary))"
          spellCheck={false}
        />
        {themeDefault ? (
          <button
            type="button"
            onClick={() => onChange(themeDefault)}
            disabled={!canRestoreTheme}
            className={cn(
              "shrink-0 rounded-lg border px-2.5 py-2 text-[11px] font-semibold transition-colors",
              canRestoreTheme
                ? "border-amber-500/40 text-amber-200 hover:bg-amber-500/10"
                : "cursor-not-allowed border-[#2a2a2a] text-zinc-600"
            )}
          >
            Tema
          </button>
        ) : null}
      </div>
    </div>
  );
}
