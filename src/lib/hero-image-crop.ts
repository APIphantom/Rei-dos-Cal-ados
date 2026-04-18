import type { Area } from "react-easy-crop";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", () => reject(new Error("Imagem inválida.")));
    img.src = src;
  });
}

/** Exporta o JPEG do recorte (pixels em coordenadas da imagem original). */
export async function getHeroCroppedImageBlob(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas não disponível.");

  const w = Math.max(1, Math.round(pixelCrop.width));
  const h = Math.max(1, Math.round(pixelCrop.height));
  canvas.width = w;
  canvas.height = h;

  ctx.drawImage(
    image,
    Math.round(pixelCrop.x),
    Math.round(pixelCrop.y),
    w,
    h,
    0,
    0,
    w,
    h
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Falha ao gerar imagem."))),
      "image/jpeg",
      0.92
    );
  });
}
