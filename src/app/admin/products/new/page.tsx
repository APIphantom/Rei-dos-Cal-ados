import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ProductForm } from "@/components/admin/ProductForm";
import { PRODUCT_TYPE_SUGGESTIONS, STORE_BRAND_NAMES } from "@/config/store-brands";

export default async function NewProductPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-[#F59E0B]"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar à lista
        </Link>
        <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight">Novo produto</h1>
        <p className="mt-2 text-sm text-zinc-500">Preencha as seções e salve no final da página.</p>
      </div>

      <ProductForm mode="create" brandSuggestions={STORE_BRAND_NAMES} categorySuggestions={PRODUCT_TYPE_SUGGESTIONS} />
    </div>
  );
}
