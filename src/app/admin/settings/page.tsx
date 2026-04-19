import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { HeroSettingsForm } from "@/components/admin/HeroSettingsForm";
import { StoreContactForm } from "@/components/admin/StoreContactForm";
import { TestimonialsSettingsForm } from "@/components/admin/TestimonialsSettingsForm";
import { getHeroSettings } from "@/lib/site-settings";
import { getStorePublicSettings } from "@/lib/store-public-settings";

export default async function AdminSettingsPage() {
  const [hero, store] = await Promise.all([getHeroSettings(), getStorePublicSettings()]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 sm:space-y-8">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-[#F59E0B]"
        >
          <ChevronLeft className="h-4 w-4" />
          Painel
        </Link>
        <h1 className="mt-3 font-heading text-2xl font-bold tracking-tight sm:mt-4 sm:text-3xl">Configurações da loja</h1>
        <p className="mt-2 text-sm text-zinc-500">Hero, contato da loja e depoimentos da página inicial.</p>
      </div>

      <HeroSettingsForm initialType={hero.type} initialUrl={hero.url} />
      <StoreContactForm initial={store} />
      <TestimonialsSettingsForm />
    </div>
  );
}
