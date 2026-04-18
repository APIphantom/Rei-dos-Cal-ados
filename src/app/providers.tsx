"use client";

import { Toaster } from "sonner";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { StorePublicProvider } from "@/contexts/store-public-context";
import type { StorePublicSettings } from "@/lib/store-public-settings";

type Props = {
  children: React.ReactNode;
  storePublic: StorePublicSettings;
};

export function Providers({ children, storePublic }: Props) {
  return (
    <StorePublicProvider value={storePublic}>
      <AuthProvider>
        {children}
        <Toaster richColors position="top-center" theme="dark" closeButton />
      </AuthProvider>
    </StorePublicProvider>
  );
}
