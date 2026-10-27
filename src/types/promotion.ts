export type PromotionType = "campaign" | "kit";

export type Promotion = {
  id: string;
  offerType: PromotionType;
  title: string;
  shortText: string;
  commercialText: string | null;
  imageUrl: string;
  imageAlt: string;
  productId: string | null;
  ctaLabel: string;
  ctaHref: string;
  isActive: boolean;
  sortOrder: number;
};

export type PromotionProductOption = {
  id: string;
  name: string;
  brand: string;
  category: string;
  imageUrl: string;
};
