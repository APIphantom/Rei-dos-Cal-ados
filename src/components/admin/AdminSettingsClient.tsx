"use client";

import { useState } from "react";
import { HeroSettingsForm } from "@/components/admin/HeroSettingsForm";
import { StoreContactForm } from "@/components/admin/StoreContactForm";
import { TestimonialsSettingsForm } from "@/components/admin/TestimonialsSettingsForm";
import type { HeroMediaType } from "@/lib/site-settings";
import type { StorePublicSettings } from "@/lib/store-public-settings";
import { cn } from "@/lib/utils";

type Tab = "hero" | "contact" | "testimonials";

type Props = {
  heroType: HeroMediaType;
  heroUrl: string | null;
  store: StorePublicSettings;
};

export function AdminSettingsClient({ heroType, heroUrl, store }: Props) {
  const [tab, setTab] = useState<Tab>("hero");

  const tabs: { id: Tab; label: string; desc: string }[] = [
    { id: "hero", label: "Hero", desc: "Imagem ou vídeo de capa" },
    { id: "contact", label: "Contato", desc: "WhatsApp e redes" },
    { id: "testimonials", label: "Depoimentos", desc: "Página inicial" },
  ];

  return (
    <div className="space-y-8">
      <div
        className="flex flex-col gap-2 rounded-2xl border border-[#2a2a2a] bg-[#080808] p-1.5 sm:flex-row"
        role="tablist"
        aria-label="Secções das configurações"
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex min-h-[52px] flex-1 flex-col items-start rounded-xl px-4 py-3 text-left transition-colors",
              tab === t.id
                ? "bg-[#F59E0B] text-black shadow-lg shadow-[#F59E0B]/15"
                : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100"
            )}
          >
            <span className="text-sm font-bold">{t.label}</span>
            <span
              className={cn(
                "mt-0.5 text-xs",
                tab === t.id ? "text-black/75" : "text-zinc-500"
              )}
            >
              {t.desc}
            </span>
          </button>
        ))}
      </div>

      <div className="min-h-[200px]">
        {tab === "hero" && <HeroSettingsForm initialType={heroType} initialUrl={heroUrl} />}
        {tab === "contact" && <StoreContactForm initial={store} />}
        {tab === "testimonials" && <TestimonialsSettingsForm />}
      </div>
    </div>
  );
}
