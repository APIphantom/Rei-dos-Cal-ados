"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/** Largura lógica “desktop” para alinhar código com a loja real (≈1280px). */
export const DESKTOP_PREVIEW_WIDTH_PX = 1280;

/** Escala visual (72%): cabe no painel sem perder a proporção desktop. */
export const DESKTOP_PREVIEW_SCALE = 0.72;

type Props = {
  children: ReactNode;
  /** Escala 0–1 (ex.: 0.72 = 72%). */
  scale?: number;
  className?: string;
};

/**
 * Renderiza filhos em largura fixa de desktop e reduz com transform,
 * ajustando a altura do contentor para não deixar espaço em branco enorme.
 */
export function ScaledDesktopPreview({ children, scale = DESKTOP_PREVIEW_SCALE, className }: Props) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [layoutHeight, setLayoutHeight] = useState(420);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;

    const measure = () => {
      const next = el.offsetHeight;
      setLayoutHeight((prev) => (prev === next ? prev : next));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const outerW = Math.round(DESKTOP_PREVIEW_WIDTH_PX * scale);
  const outerH = Math.max(120, Math.round(layoutHeight * scale));

  return (
    <div
      className={className}
      style={{
        width: outerW,
        minHeight: outerH,
        maxWidth: "100%",
      }}
    >
      <div
        className="overflow-hidden"
        style={{
          width: outerW,
          height: outerH,
        }}
      >
        <div
          ref={innerRef}
          style={{
            width: DESKTOP_PREVIEW_WIDTH_PX,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
