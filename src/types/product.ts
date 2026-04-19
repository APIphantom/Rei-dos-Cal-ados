export type ProductColor = { name: string; hex: string };

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
  /** Etiquetas de vitrine (ex.: Esportivo, Promoção) */
  tags: string[];
  isFeatured: boolean;
  isBestseller: boolean;
  stockQuantity: number;
};
