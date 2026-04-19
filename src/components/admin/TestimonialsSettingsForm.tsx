"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { ImagePlus, Loader2, Package, Trash2, UserRound } from "lucide-react";
import { fileToCompressedJpegDataUrl } from "@/lib/compress-image";
import { useTestimonialsLocalStore } from "@/features/storefront/testimonials-local-store";
import { cn } from "@/lib/utils";

const MAX_AVATAR_BYTES = 85_000;
const MAX_AVATAR_CHARS = 150_000;
const MAX_PRODUCT_BYTES = 320_000;
const MAX_PRODUCT_CHARS = 200_000;

export function TestimonialsSettingsForm() {
  const rawItems = useTestimonialsLocalStore((s) => s.items);
  const items = useMemo(
    () => [...rawItems].sort((a, b) => a.displayOrder - b.displayOrder),
    [rawItems]
  );
  const add = useTestimonialsLocalStore((s) => s.add);
  const remove = useTestimonialsLocalStore((s) => s.remove);

  const [author, setAuthor] = useState("");
  const [body, setBody] = useState("");
  const [productPreview, setProductPreview] = useState<string | null>(null);
  const [productPendingFile, setProductPendingFile] = useState<File | null>(null);
  const [customerPreview, setCustomerPreview] = useState<string | null>(null);
  const [customerPendingFile, setCustomerPendingFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const productFileInputRef = useRef<HTMLInputElement>(null);
  const customerFileInputRef = useRef<HTMLInputElement>(null);

  const revokeProductPreview = useCallback(() => {
    if (productPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(productPreview);
    }
    setProductPreview(null);
    setProductPendingFile(null);
  }, [productPreview]);

  const revokeCustomerPreview = useCallback(() => {
    if (customerPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(customerPreview);
    }
    setCustomerPreview(null);
    setCustomerPendingFile(null);
  }, [customerPreview]);

  const onPickProduct = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    revokeProductPreview();
    const url = URL.createObjectURL(f);
    setProductPreview(url);
    setProductPendingFile(f);
  };

  const onPickCustomer = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    revokeCustomerPreview();
    const url = URL.createObjectURL(f);
    setCustomerPreview(url);
    setCustomerPendingFile(f);
  };

  const onSubmit = async () => {
    const a = author.trim();
    const b = body.trim();
    if (!a || !b) {
      toast.error("Preencha nome e mensagem.");
      return;
    }
    if (!productPendingFile) {
      toast.error("Envie uma foto do produto comprado.");
      return;
    }
    setBusy(true);
    try {
      const { dataUrl: productDataUrl } = await fileToCompressedJpegDataUrl(productPendingFile, {
        maxSide: 1200,
        maxBytes: MAX_PRODUCT_BYTES,
      });
      if (productDataUrl.length > MAX_PRODUCT_CHARS) {
        toast.error("Foto do produto ainda grande demais. Tente outra imagem.");
        return;
      }

      let imageUrl: string | null = null;
      if (customerPendingFile) {
        const { dataUrl } = await fileToCompressedJpegDataUrl(customerPendingFile, {
          maxSide: 400,
          maxBytes: MAX_AVATAR_BYTES,
        });
        if (dataUrl.length > MAX_AVATAR_CHARS) {
          toast.error("Foto da pessoa ainda grande demais. Tente outra foto.");
          return;
        }
        imageUrl = dataUrl;
      }

      add({
        authorName: a,
        body: b,
        imageUrl,
        productImageUrl: productDataUrl,
      });
      toast.success("Depoimento adicionado.");
      setAuthor("");
      setBody("");
      revokeProductPreview();
      revokeCustomerPreview();
    } catch {
      toast.error("Não foi possível processar as imagens.");
    } finally {
      setBusy(false);
    }
  };

  const canSubmit =
    author.trim().length > 0 && body.trim().length > 0 && productPendingFile !== null;

  return (
    <div className="space-y-6 rounded-2xl border border-[#2a2a2a] bg-[#0f0f0f] p-4 sm:space-y-8 md:p-8">
      <div>
        <h2 className="font-heading text-lg font-bold text-white">Depoimentos (home)</h2>
        <p className="mt-2 text-sm text-zinc-500">
          Foto do produto (obrigatória), texto e nome do cliente; foto da pessoa é opcional. Os depoimentos aparecem no
          carrossel da página inicial.
        </p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2">
        {items.map((t) => (
          <li
            key={t.id}
            className="group flex flex-col overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[#111] shadow-lg transition-all duration-300 hover:border-[#F59E0B]/25 hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.5)]"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-[#2a2a2a] bg-[#0a0a0a]">
              {t.productImageUrl ? (
                <Image
                  src={t.productImageUrl}
                  alt=""
                  fill
                  sizes="(max-width:768px) 100vw, 360px"
                  className="object-cover"
                  unoptimized={t.productImageUrl.startsWith("data:")}
                />
              ) : (
                <div className="flex h-full min-h-[120px] w-full flex-col items-center justify-center gap-2 text-zinc-600">
                  <Package className="h-10 w-10 opacity-50" />
                  <span className="text-xs">Sem foto do produto</span>
                </div>
              )}
            </div>
            <div className="space-y-3 p-4">
              <p className="line-clamp-4 text-sm leading-relaxed text-zinc-400">“{t.body}”</p>
              <div className="flex items-center gap-3 border-t border-[#2a2a2a] pt-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-[#F59E0B]/35 bg-[#0a0a0a] shadow-inner">
                  {t.imageUrl ? (
                    <Image
                      src={t.imageUrl}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-cover"
                      unoptimized={t.imageUrl.startsWith("data:")}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-zinc-600">
                      <UserRound className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <p className="text-sm font-bold tracking-wide text-[#F59E0B]">{t.authorName}</p>
              </div>
            </div>
            <div className="flex justify-end border-t border-[#2a2a2a] bg-black/20 px-3 py-2">
              <button
                type="button"
                onClick={() => {
                  remove(t.id);
                  toast.success("Removido.");
                }}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Excluir
              </button>
            </div>
          </li>
        ))}
        {items.length === 0 && (
          <li className="col-span-full rounded-xl border border-dashed border-[#2a2a2a] py-12 text-center text-sm text-zinc-500">
            Nenhum depoimento ainda. Adicione abaixo.
          </li>
        )}
      </ul>

      <div className="space-y-5 border-t border-[#2a2a2a] pt-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Novo depoimento</p>

        <div className="overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[#111] p-5 md:p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <div className="flex min-w-0 flex-1 flex-col gap-6 sm:flex-row sm:items-start sm:justify-center lg:justify-start">
              <div className="flex w-full min-w-0 flex-col items-center gap-2 sm:max-w-[200px]">
                <p className="w-full text-center text-[10px] font-bold uppercase tracking-wider text-zinc-500 sm:text-left">
                  Foto do produto *
                </p>
                <div
                  className={cn(
                    "relative aspect-[4/3] w-full max-w-[220px] overflow-hidden rounded-xl border-2 border-dashed border-[#2a2a2a] bg-[#0a0a0a] transition-colors sm:max-w-none",
                    productPreview && "border-[#F59E0B]/40"
                  )}
                >
                  {productPreview ? (
                    <Image src={productPreview} alt="" fill className="object-cover" unoptimized />
                  ) : (
                    <div className="flex h-full min-h-[120px] flex-col items-center justify-center gap-2 text-zinc-600">
                      <ImagePlus className="h-8 w-8" />
                      <span className="px-2 text-center text-[10px] font-medium uppercase">Produto</span>
                    </div>
                  )}
                </div>
                <input
                  ref={productFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onPickProduct}
                />
                <div className="flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => productFileInputRef.current?.click()}
                    className="rounded-full border border-[#2a2a2a] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-300 transition-colors hover:border-[#F59E0B]/50"
                  >
                    {productPreview ? "Trocar" : "Enviar"}
                  </button>
                  {productPreview && (
                    <button
                      type="button"
                      onClick={revokeProductPreview}
                      className="text-[10px] font-semibold uppercase tracking-wider text-red-400/90 hover:text-red-300"
                    >
                      Remover
                    </button>
                  )}
                </div>
              </div>

              <div className="flex min-w-0 flex-col items-center gap-2 sm:w-36">
                <p className="w-full text-center text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Foto da pessoa
                </p>
                <div
                  className={cn(
                    "relative h-28 w-28 overflow-hidden rounded-full border-2 border-dashed border-[#2a2a2a] bg-[#0a0a0a] transition-colors",
                    customerPreview && "border-[#F59E0B]/40"
                  )}
                >
                  {customerPreview ? (
                    <Image src={customerPreview} alt="" fill className="object-cover" unoptimized />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-1.5 text-zinc-600">
                      <UserRound className="h-8 w-8" />
                      <span className="px-2 text-center text-[10px] font-medium uppercase">Opcional</span>
                    </div>
                  )}
                </div>
                <input
                  ref={customerFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onPickCustomer}
                />
                <div className="flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => customerFileInputRef.current?.click()}
                    className="rounded-full border border-[#2a2a2a] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-300 transition-colors hover:border-[#F59E0B]/50"
                  >
                    {customerPreview ? "Trocar" : "Enviar"}
                  </button>
                  {customerPreview && (
                    <button
                      type="button"
                      onClick={revokeCustomerPreview}
                      className="text-[10px] font-semibold uppercase tracking-wider text-red-400/90 hover:text-red-300"
                    >
                      Remover
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="min-w-0 flex-1 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Nome</label>
                <input
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Ex.: Maria S."
                  className="h-11 w-full rounded-xl border border-[#2a2a2a] bg-[#0a0a0a] px-4 text-sm text-white outline-none transition-colors focus:border-[#F59E0B]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Mensagem</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={4}
                  placeholder="Escreva o depoimento…"
                  className="w-full rounded-xl border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[#F59E0B]"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          disabled={busy || !canSubmit}
          onClick={() => void onSubmit()}
          className="inline-flex h-12 min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-[#F59E0B] px-8 text-xs font-bold uppercase tracking-wider text-black transition-opacity hover:opacity-90 disabled:opacity-50 sm:w-auto"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Adicionar depoimento
        </button>
      </div>
    </div>
  );
}
