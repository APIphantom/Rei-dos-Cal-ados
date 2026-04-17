export type ProductColor = { name: string; hex: string };

/** Produto da loja (mapeado da tabela `products` no Supabase) */
export type Product = {
  id: string;
  name: string;
  /** Mantido para compatibilidade com telas que usam "modelo" — igual a `name` */
  model: string;
  description: string;
  price: number;
  imageUrl: string;
  images: string[];
  sizes: string[];
  colors: ProductColor[];
  category: string;
  brand: string;
  isFeatured: boolean;
  isBestseller: boolean;
};
