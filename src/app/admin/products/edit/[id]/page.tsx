import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { ProductForm } from "@/components/admin/ProductForm";
import type { ProductPayload } from "@/features/admin/products/actions";
import { PRODUCT_TYPE_SUGGESTIONS, STORE_BRAND_NAMES } from "@/config/store-brands";
import { getProductById } from "@/features/products/services/products";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) notFound();

  const initialValues: Partial<ProductPayload> = {
    brand: product.brand,
    name: product.name,
    description: product.description,
    price: product.price,
    category: product.category,
    image_url: product.imageUrl,
    gallery_urls: product.images.length > 1 ? product.images.slice(1) : [],
    tags: product.tags,
    sizes: product.sizes,
    colors: product.colors,
    is_featured: product.isFeatured,
    is_bestseller: product.isBestseller,
  };

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
        <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight">Editar produto</h1>
        <p className="mt-2 text-sm text-zinc-500">{product.name}</p>
      </div>

      <ProductForm
        mode="edit"
        productId={id}
        initialValues={initialValues}
        brandSuggestions={STORE_BRAND_NAMES}
        categorySuggestions={PRODUCT_TYPE_SUGGESTIONS}
      />
    </div>
  );
}
