"use client";

import { createContext, useContext } from "react";
import type { StorePublicSettings } from "@/lib/store-public-settings";
import { DEFAULT_WHATSAPP_E164 } from "@/lib/store-defaults";

const Ctx = createContext<StorePublicSettings | null>(null);

export function StorePublicProvider({
  value,
  children,
}: {
  value: StorePublicSettings;
  children: React.ReactNode;
}) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStorePublicSettings(): StorePublicSettings {
  const v = useContext(Ctx);
  return (
    v ?? {
      whatsappE164: DEFAULT_WHATSAPP_E164,
      contactEmail: null,
      contactPhone: null,
      contactCity: null,
      instagramUrl: null,
      facebookUrl: null,
    }
  );
}
