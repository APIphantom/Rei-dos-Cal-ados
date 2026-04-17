import { Inter, Poppins } from "next/font/google";

/** Títulos — pesos 400 / 500 / 700 conforme design system */
export const fontHeading = Poppins({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "700"],
  variable: "--font-heading",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

/** Corpo — texto corrido e UI */
export const fontBody = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "700"],
  variable: "--font-body",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});
