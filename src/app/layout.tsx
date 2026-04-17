import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloating } from "@/components/layout/WhatsAppFloating";
import { CartDrawer } from "@/features/cart/components/CartDrawer";
import { fontBody, fontHeading } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "Rei Dos Calçados",
  description: "Calçados premium com entrega rápida e até 6x sem juros.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${fontHeading.variable} ${fontBody.variable}`} suppressHydrationWarning>
      <body className="min-h-screen font-body text-base font-normal text-foreground antialiased">
        <Providers>
          <Header />
          <CartDrawer />
          <WhatsAppFloating />
          <main className="pt-14">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

