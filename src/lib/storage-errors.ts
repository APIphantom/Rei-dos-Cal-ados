/** Mensagem amigável para erros comuns do Supabase Storage. */
export function mapStorageUploadError(message: string): string {
  if (/bucket not found/i.test(message)) {
    return "Bucket de Storage não encontrado. No Supabase, abra SQL Editor e execute o script supabase/manual/ensure_storage_buckets.sql (ou rode as migrações do projeto).";
  }
  return message;
}
