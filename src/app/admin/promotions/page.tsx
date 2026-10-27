import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PromotionsManager } from "@/components/admin/PromotionsManager";
import { getAllPromotions } from "@/features/promotions/service";
import { getAllProducts } from "@/features/products/services/products";

export default async function AdminPromotionsPage() {
  const [promotions, products] = await Promise.all([getAllPromotions(), getAllProducts()]);
  const productOptions = products.map((product) => ({
    id: product.id,
    name: product.name,
    brand: product.brand,
    category: product.category,
    imageUrl: product.imageUrl,
  }));

  return (
    <div className="mx-auto min-w-0 max-w-6xl space-y-6 sm:space-y-8">
      <div className="space-y-2">
        <Link href="/admin" className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-primary">
          <ChevronLeft className="h-4 w-4" aria-hidden /> Painel
        </Link>
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">Loja · vitrine</p>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl">Promoções</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">
          Cadastre a imagem, a mensagem curta e o botão de cada oferta. A publicação é apenas informativa e não altera preços nem o carrinho.
        </p>
      </div>
      <PromotionsManager promotions={promotions} products={productOptions} />
    </div>
  );
}
