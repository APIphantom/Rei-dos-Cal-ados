export type Testimonial = {
  id: string;
  authorName: string;
  body: string;
  displayOrder: number;
  /** Foto do cliente (data URL), apenas quando gerido pelo store local no admin. */
  imageUrl?: string | null;
  /** Foto do produto associado ao depoimento (data URL no admin local). */
  productImageUrl?: string | null;
};
