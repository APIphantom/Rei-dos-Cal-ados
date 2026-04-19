/** Asset da marca (PNG com fundo transparente em `public/`). */
export const STORE_LOGO = {
  src: "/logo-rei-dos-calcados.png",
  width: 1024,
  height: 684,
} as const;

const REI_DOS_CALCADOS = /^rei\s*dos\s*cal[cç]ados$/i;

/** Hero/banner: etiqueta vazia ou o nome antigo em texto passa a mostrar a logo. */
export function isStoreNameEyebrowText(s: string): boolean {
  const t = s.trim();
  return t === "" || REI_DOS_CALCADOS.test(t);
}
