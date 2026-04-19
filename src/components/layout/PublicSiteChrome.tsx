"use client";

import { usePathname } from "next/navigation";
import { CartDrawer } from "@/features/cart/components/CartDrawer";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { WhatsAppFloating } from "@/components/layout/WhatsAppFloating";
import type { StorePublicSettings } from "@/lib/store-public-settings";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  storePublic: StorePublicSettings;
};

export function PublicSiteChrome({ children, storePublic }: Props) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") ?? false;

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-[#050505] text-white">{children}</div>
    );
  }

  return (
    <>
      <Header />
      <CartDrawer />
      <WhatsAppFloating />
      <main className={cn("min-w-0 pt-14")}>{children}</main>
      <Footer store={storePublic} />
    </>
  );
}
