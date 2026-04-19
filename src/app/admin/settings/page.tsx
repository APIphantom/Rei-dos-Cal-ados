import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AdminSettingsClient } from "@/components/admin/AdminSettingsClient";
import { getHeroSettings } from "@/lib/site-settings";
import { getStorePublicSettings } from "@/lib/store-public-settings";

export default async function AdminSettingsPage() {
  const [hero, store] = await Promise.all([getHeroSettings(), getStorePublicSettings()]);

  return (
    <div className="mx-auto max-w-3xl space-y-8 sm:space-y-10">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-[#F59E0B]"
        >
          <ChevronLeft className="h-4 w-4" />
          Painel
        </Link>
        <h1 className="mt-3 font-heading text-2xl font-bold tracking-tight sm:mt-4 sm:text-3xl">Configurações da loja</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-500">
          Ajuste a mídia do hero, os canais de contato e os depoimentos — uma secção de cada vez para manter o painel
          legível.
        </p>
      </div>

      <AdminSettingsClient heroType={hero.type} heroUrl={hero.url} store={store} />
    </div>
  );
}
