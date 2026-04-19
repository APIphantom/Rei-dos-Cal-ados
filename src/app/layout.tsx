import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { PublicSiteChrome } from "@/components/layout/PublicSiteChrome";
import { fontBody, fontHeading } from "@/lib/fonts";
import { getStorePublicSettings } from "@/lib/store-public-settings";

export const metadata: Metadata = {
  title: "Rei Dos Calçados",
  description: "Calçados premium com entrega rápida e até 6x sem juros.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const storePublic = await getStorePublicSettings();

  return (
    <html lang="pt-BR" className={`${fontHeading.variable} ${fontBody.variable}`} suppressHydrationWarning>
      <body className="min-h-screen font-body text-base font-normal text-foreground antialiased">
        <Providers storePublic={storePublic}>
          <PublicSiteChrome storePublic={storePublic}>{children}</PublicSiteChrome>
        </Providers>
      </body>
    </html>
  );
}
