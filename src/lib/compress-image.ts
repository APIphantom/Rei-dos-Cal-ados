/**
 * Reduz JPEG local para caber no localStorage (~5MB total por origem).
 * Meta típica: ≤ 350KB após redimensionar lado máx. 1920px.
 */
export async function fileToCompressedJpegDataUrl(
  file: File,
  opts: { maxSide?: number; maxBytes?: number; initialQuality?: number } = {}
): Promise<{ dataUrl: string; bytes: number; width: number; height: number }> {
  const maxSide = opts.maxSide ?? 1920;
  const maxBytes = opts.maxBytes ?? 350_000;
  let quality = opts.initialQuality ?? 0.88;

  const bitmap = await createImageBitmap(file);

  let w = bitmap.width;
  let h = bitmap.height;
  if (w > maxSide || h > maxSide) {
    if (w >= h) {
      h = Math.round((h * maxSide) / w);
      w = maxSide;
    } else {
      w = Math.round((w * maxSide) / h);
      h = maxSide;
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  let dataUrl = canvas.toDataURL("image/jpeg", quality);
  let bytes = approximateDataUrlBytes(dataUrl);

  while (bytes > maxBytes && quality > 0.45) {
    quality -= 0.07;
    dataUrl = canvas.toDataURL("image/jpeg", quality);
    bytes = approximateDataUrlBytes(dataUrl);
  }

  if (bytes > maxBytes * 1.2) {
    throw new Error("IMAGE_TOO_LARGE");
  }

  return { dataUrl, bytes, width: w, height: h };
}

function approximateDataUrlBytes(dataUrl: string): number {
  const base64 = dataUrl.split(",")[1];
  if (!base64) return dataUrl.length * 0.75;
  return Math.floor((base64.length * 3) / 4);
}
