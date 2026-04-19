export type ProductColor = { name: string; hex: string; /** Unidades disponíveis nesta cor */ stock: number };

export type ProductSize = { label: string; stock: number };

export type Product = {
  id: string;
  name: string;
  /** Mantido para compatibilidade com telas que usam "modelo" — igual a `name` */
  model: string;
  description: string;
  price: number;
  imageUrl: string;
  images: string[];
  sizes: ProductSize[];
  colors: ProductColor[];
  category: string;
  brand: string;
  /** Etiquetas de vitrine (ex.: Esportivo, Promoção) */
  tags: string[];
  isFeatured: boolean;
  isBestseller: boolean;
  stockQuantity: number;
};
