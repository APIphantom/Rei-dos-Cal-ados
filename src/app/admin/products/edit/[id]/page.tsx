import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/ProductForm";
import { PRODUCT_TYPE_SUGGESTIONS, STORE_BRAND_NAMES } from "@/config/store-brands";
import {
  adminApiProductToPayload,
  type AdminApiProductRow,
} from "@/features/admin/products/map-api-product";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: product, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!product) {
    notFound();
  }

  const initial = adminApiProductToPayload(product as AdminApiProductRow);

  return (
    <div className="mx-auto max-w-5xl space-y-6 sm:space-y-8">
      <div>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-[#F59E0B]"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar à lista
        </Link>
        <h1 className="mt-3 font-heading text-2xl font-bold tracking-tight sm:mt-4 sm:text-3xl">Editar produto</h1>
        {initial.name && <p className="mt-2 text-sm text-zinc-500">{initial.name}</p>}
      </div>

      <ProductForm
        mode="edit"
        productId={id}
        initialValues={initial}
        brandSuggestions={STORE_BRAND_NAMES}
        categorySuggestions={PRODUCT_TYPE_SUGGESTIONS}
      />
    </div>
  );
}
