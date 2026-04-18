import { Inter, Poppins } from "next/font/google";

export const fontHeading = Poppins({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
  variable: "--font-heading",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

/** Inter em modo variável: um arquivo, evita vários preloads de peso estático. */
export const fontBody = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-body",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});
