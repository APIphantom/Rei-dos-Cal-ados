/** Bundled hero art can be selected and stored alongside uploaded public media. */
export const BUNDLED_HERO_ART_URL = "/hero/rei-dos-calcados-hero-enhanced.png";
export const BUNDLED_HERO_MOBILE_ART_URL = "/hero/rei-dos-calcados-hero-mobile.png";
export const BUNDLED_HERO_DESKTOP_WEBP_URL = "/hero/rei-dos-calcados-hero-enhanced.webp";
export const BUNDLED_HERO_MOBILE_WEBP_URL = "/hero/rei-dos-calcados-hero-mobile.webp";

export const MAX_HERO_UPLOAD_BYTES = 48 * 1024 * 1024;

const HERO_UPLOAD_FORMATS: Record<string, { kind: "image" | "video"; contentType: string }> = {
  avif: { kind: "image", contentType: "image/avif" },
  jpeg: { kind: "image", contentType: "image/jpeg" },
  jpg: { kind: "image", contentType: "image/jpeg" },
  png: { kind: "image", contentType: "image/png" },
  webp: { kind: "image", contentType: "image/webp" },
  mov: { kind: "video", contentType: "video/quicktime" },
  mp4: { kind: "video", contentType: "video/mp4" },
  webm: { kind: "video", contentType: "video/webm" },
};

export function getHeroUploadDescriptor(file: { name: string; type: string }) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const fromExtension = HERO_UPLOAD_FORMATS[extension];
  const mime = file.type.toLowerCase().split(";")[0]?.trim() ?? "";
  const mimeKind = mime.startsWith("image/") ? "image" : mime.startsWith("video/") ? "video" : null;

  if (!fromExtension || (mimeKind && mimeKind !== fromExtension.kind)) return null;
  const mimeAliases = ["image/jpg", "image/pjpeg", "application/octet-stream"];
  if (mime && mime !== fromExtension.contentType && !mimeAliases.includes(mime)) return null;
  return { ...fromExtension, extension };
}

export function isBundledHeroArtUrl(value: string | null | undefined): boolean {
  return value === BUNDLED_HERO_ART_URL;
}
