import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/features/products/components/ProductDetail";
import { getProductById, getRelatedProducts } from "@/features/products/services/products";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) {
    return { title: "Produto | Rei Dos Calçados" };
  }
  return {
    title: `${product.name} | Rei Dos Calçados`,
    description: product.description.slice(0, 155),
    openGraph: {
      images: product.images[0] ? [{ url: product.images[0] }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();
  const related = await getRelatedProducts(product.category, product.id);
  return <ProductDetail product={product} related={related} />;
}
