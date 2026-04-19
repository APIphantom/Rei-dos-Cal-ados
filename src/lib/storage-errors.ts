export function mapStorageUploadError(message: string): string {
  if (/bucket not found/i.test(message)) {
    return "O armazenamento de imagens não está configurado. Contacte o suporte técnico.";
  }
  return message;
}
