import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { HeroSettingsForm } from "@/components/admin/HeroSettingsForm";
import { StoreContactForm } from "@/components/admin/StoreContactForm";
import { TestimonialsSettingsForm } from "@/components/admin/TestimonialsSettingsForm";
import { getHeroSettings } from "@/lib/site-settings";
import { getStorePublicSettings } from "@/lib/store-public-settings";
import { getTestimonials } from "@/lib/testimonials";

export default async function AdminSettingsPage() {
  const [hero, store, testimonials] = await Promise.all([
    getHeroSettings(),
    getStorePublicSettings(),
    getTestimonials(),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-[#F59E0B]"
        >
          <ChevronLeft className="h-4 w-4" />
          Painel
        </Link>
        <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight">Configurações da loja</h1>
        <p className="mt-2 text-sm text-zinc-500">Hero, contato, redes e depoimentos (Supabase).</p>
      </div>

      <HeroSettingsForm initialType={hero.type} initialUrl={hero.url} />
      <StoreContactForm initial={store} />
      <TestimonialsSettingsForm initial={testimonials} />
    </div>
  );
}
