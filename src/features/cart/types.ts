import type { Product } from "@/types/product";

export type CartLine = {
  product: Product;
  size: string;
  color: string;
  quantity: number;
};

