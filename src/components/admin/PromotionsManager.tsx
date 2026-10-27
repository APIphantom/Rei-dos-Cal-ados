"use client";

import Image from "next/image";
import { useEffect, useState, type FormEvent } from "react";
import { ImagePlus, Loader2, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deletePromotion, savePromotion, uploadPromotionImage } from "@/features/admin/promotions/actions";
import type { Promotion, PromotionProductOption, PromotionType } from "@/types/promotion";
import { cn } from "@/lib/utils";

type Props = { promotions: Promotion[]; products: PromotionProductOption[] };
type Draft = Omit<Promotion, "id"> & { id?: string };

const NEW_PROMOTION: Draft = {
  offerType: "campaign",
  title: "",
  shortText: "",
  commercialText: null,
  imageUrl: "",
  imageAlt: "",
  productId: null,
  ctaLabel: "Ver catálogo",
  ctaHref: "/#catalogo",
  isActive: false,
  sortOrder: 0,
};

export function PromotionsManager({ promotions: initialPromotions, products }: Props) {
  const [promotions, setPromotions] = useState(initialPromotions);
  const [editing, setEditing] = useState<Promotion | null | "new">(null);

  function onSaved(saved: Promotion) {
    setPromotions((current) => {
      const next = current.filter((item) => item.id !== saved.id).concat(saved);
      return next.sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title, "pt-BR"));
    });
    setEditing(null);
  }

  async function onDelete(promotion: Promotion) {
    if (!window.confirm(`Excluir a promoção “${promotion.title}”?`)) return;
    const result = await deletePromotion(promotion.id);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setPromotions((current) => current.filter((item) => item.id !== promotion.id));
    if (editing && editing !== "new" && editing.id === promotion.id) setEditing(null);
    toast.success("Promoção excluída.");
  }

  return (
    <div className="grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,0.9fr)_minmax(380px,1.1fr)]">
      <section className="min-w-0 space-y-4 rounded-2xl border border-white/[0.08] bg-[#0d0d0c] p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">Vitrine</p>
            <h2 className="mt-1 font-heading text-xl font-bold text-white">Promoções da Home</h2>
          </div>
          <button
            type="button"
            onClick={() => setEditing("new")}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" aria-hidden /> Nova promoção
          </button>
        </div>
        <p className="text-sm leading-relaxed text-zinc-500">
          Ative apenas ofertas confirmadas pela loja. O tipo “Kit” é uma categoria editorial e não altera preços nem o carrinho.
        </p>

        <ul className="space-y-3">
          {promotions.map((promotion) => (
            <li key={promotion.id} className="flex min-w-0 gap-3 rounded-xl border border-white/[0.08] bg-black/25 p-3 sm:gap-4 sm:p-4">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black sm:h-24 sm:w-28">
                <Image src={promotion.imageUrl} alt={promotion.imageAlt} fill sizes="112px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", promotion.isActive ? "bg-emerald-400/10 text-emerald-300" : "bg-zinc-700/50 text-zinc-400")}>
                    {promotion.isActive ? "Ativa" : "Rascunho"}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-primary">{promotion.offerType === "kit" ? "Kit" : "Promoção"}</span>
                </div>
                <h3 className="mt-2 break-words text-sm font-bold text-white">{promotion.title}</h3>
                <p className="mt-1 line-clamp-2 break-words text-xs text-zinc-500">{promotion.shortText}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={() => setEditing(promotion)} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-white/10 px-3 text-xs font-semibold text-zinc-300 hover:border-primary/40 hover:text-primary">
                    <Pencil className="h-3.5 w-3.5" aria-hidden /> Editar
                  </button>
                  <button type="button" onClick={() => void onDelete(promotion)} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-white/10 px-3 text-xs font-semibold text-zinc-500 hover:border-red-400/30 hover:text-red-300">
                    <Trash2 className="h-3.5 w-3.5" aria-hidden /> Excluir
                  </button>
                </div>
              </div>
            </li>
          ))}
          {promotions.length === 0 && (
            <li className="rounded-xl border border-dashed border-white/10 bg-black/15 px-4 py-8 text-center text-sm text-zinc-500">
              Nenhuma promoção cadastrada.
            </li>
          )}
        </ul>
      </section>

      {editing !== null ? (
        <PromotionEditor
          key={editing === "new" ? "new" : editing.id}
          initial={editing === "new" ? NEW_PROMOTION : editing}
          products={products}
          onCancel={() => setEditing(null)}
          onSaved={onSaved}
        />
      ) : (
        <section className="flex min-h-64 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#0d0d0c] p-6 text-center text-sm text-zinc-600">
          Escolha uma promoção para editar ou crie uma nova.
        </section>
      )}
    </div>
  );
}

function PromotionEditor({
  initial,
  products,
  onCancel,
  onSaved,
}: {
  initial: Draft | Promotion;
  products: PromotionProductOption[];
  onCancel: () => void;
  onSaved: (promotion: Promotion) => void;
}) {
  const [draft, setDraft] = useState<Draft>({ ...initial });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const patch = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((current) => ({ ...current, [key]: value }));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.imageUrl && !imageFile) {
      toast.error("Escolha uma imagem do catálogo ou envie um arquivo.");
      return;
    }
    setBusy(true);
    try {
      let imageUrl = draft.imageUrl;
      if (imageFile) {
        const formData = new FormData();
        formData.set("file", imageFile);
        const uploaded = await uploadPromotionImage(formData);
        if (!uploaded.ok) {
          toast.error(uploaded.error);
          return;
        }
        imageUrl = uploaded.url;
      }

      const result = await savePromotion({
        id: draft.id,
        offer_type: draft.offerType,
        title: draft.title,
        short_text: draft.shortText,
        commercial_text: draft.commercialText,
        image_url: imageUrl,
        image_alt: draft.imageAlt,
        product_id: draft.productId,
        cta_label: draft.ctaLabel,
        cta_href: draft.ctaHref,
        is_active: draft.isActive,
        sort_order: draft.sortOrder,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      const selectedProduct = products.find((item) => item.id === draft.productId);
      onSaved({
        ...draft,
        id: result.id,
        imageUrl,
        commercialText: draft.commercialText?.trim() || null,
        imageAlt: draft.imageAlt || selectedProduct?.name || "Imagem ilustrativa da promoção",
      });
      toast.success("Promoção salva.");
    } catch {
      toast.error("Não foi possível salvar a promoção.");
    } finally {
      setBusy(false);
    }
  }

  const selectedProduct = products.find((product) => product.id === draft.productId);
  const visibleImage = previewUrl ?? draft.imageUrl;

  return (
    <form onSubmit={(event) => void submit(event)} className="min-w-0 space-y-5 rounded-2xl border border-white/[0.08] bg-[#0d0d0c] p-4 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">Editor</p>
          <h2 className="mt-1 font-heading text-xl font-bold text-white">{draft.id ? "Editar promoção" : "Nova promoção"}</h2>
        </div>
        <button type="button" onClick={onCancel} className="min-h-10 rounded-lg border border-white/10 px-3 text-xs font-semibold text-zinc-400 hover:text-white">Fechar</button>
      </div>

      <label className="block text-xs font-semibold text-zinc-400">
        Tipo
        <select value={draft.offerType} onChange={(event) => patch("offerType", event.target.value as PromotionType)} className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-[#111] px-3 text-sm text-white outline-none focus:border-primary/50">
          <option value="campaign">Promoção da loja</option>
          <option value="kit">Oferta de kit</option>
        </select>
        <span className="mt-1 block text-[11px] font-normal text-zinc-600">Classificação editorial; não altera cálculo de preço ou carrinho.</span>
      </label>

      <label className="block text-xs font-semibold text-zinc-400">
        Imagem do produto
        <select
          value={draft.productId ?? ""}
          onChange={(event) => {
            const product = products.find((item) => item.id === event.target.value);
            setImageFile(null);
            setDraft((current) => ({
              ...current,
              productId: product?.id ?? null,
              imageUrl: product?.imageUrl ?? current.imageUrl,
              imageAlt: product ? `Imagem ilustrativa: ${product.name}` : current.imageAlt,
            }));
          }}
          className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-[#111] px-3 text-sm text-white outline-none focus:border-primary/50"
        >
          <option value="">Imagem enviada/manual</option>
          {products.map((product) => <option key={product.id} value={product.id}>{product.name} · {product.brand}</option>)}
        </select>
      </label>

      <label className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-primary/30 bg-primary/[0.04] px-3 text-sm font-semibold text-primary hover:border-primary/60">
        <ImagePlus className="h-4 w-4" aria-hidden /> {imageFile ? "Trocar arquivo" : "Enviar imagem"}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            event.target.value = "";
            if (file) {
              setImageFile(file);
              setDraft((current) => ({ ...current, productId: null, imageAlt: "Imagem ilustrativa da promoção" }));
            }
          }}
        />
      </label>

      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-white/10 bg-black">
        {visibleImage ? (
          <Image src={visibleImage} alt={draft.imageAlt || "Prévia da imagem da promoção"} fill sizes="(max-width: 768px) 100vw, 480px" className="object-cover" unoptimized={!!imageFile} />
        ) : (
          <div className="grid h-full place-items-center text-sm text-zinc-600">Escolha ou envie uma imagem</div>
        )}
        {visibleImage && <span className="absolute bottom-3 left-3 rounded-full border border-white/15 bg-black/70 px-2.5 py-1 text-[10px] font-semibold text-white">Imagem ilustrativa</span>}
      </div>
      <p className="text-[11px] leading-relaxed text-zinc-600">A foto é ilustrativa; o vínculo ao produto selecionado não define quais itens participam da oferta.</p>

      <label className="block text-xs font-semibold text-zinc-400">
        Título
        <input value={draft.title} maxLength={120} onChange={(event) => patch("title", event.target.value)} required className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-[#111] px-3 text-sm text-white outline-none focus:border-primary/50" />
      </label>
      <label className="block text-xs font-semibold text-zinc-400">
        Texto curto da promoção
        <textarea value={draft.shortText} maxLength={240} onChange={(event) => patch("shortText", event.target.value)} required rows={3} className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-[#111] px-3 py-2.5 text-sm text-white outline-none focus:border-primary/50" />
      </label>
      <label className="block text-xs font-semibold text-zinc-400">
        Informação comercial complementar (opcional)
        <textarea value={draft.commercialText ?? ""} maxLength={240} onChange={(event) => patch("commercialText", event.target.value || null)} rows={2} className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-[#111] px-3 py-2.5 text-sm text-white outline-none focus:border-primary/50" />
      </label>

      <div className="grid min-w-0 gap-3 sm:grid-cols-2">
        <label className="block min-w-0 text-xs font-semibold text-zinc-400">
          Texto do botão
          <input value={draft.ctaLabel} maxLength={48} onChange={(event) => patch("ctaLabel", event.target.value)} required className="mt-2 min-h-11 w-full min-w-0 rounded-xl border border-white/10 bg-[#111] px-3 text-sm text-white outline-none focus:border-primary/50" />
        </label>
        <label className="block min-w-0 text-xs font-semibold text-zinc-400">
          Destino do botão
          <input value={draft.ctaHref} maxLength={500} onChange={(event) => patch("ctaHref", event.target.value)} required placeholder="/#catalogo" className="mt-2 min-h-11 w-full min-w-0 rounded-xl border border-white/10 bg-[#111] px-3 text-sm text-white outline-none focus:border-primary/50" />
        </label>
      </div>

      {selectedProduct && <p className="rounded-lg border border-white/[0.08] bg-black/20 p-3 text-xs text-zinc-500">Produto usado como referência visual: <strong className="text-zinc-300">{selectedProduct.name}</strong>. A participação na oferta deve ser confirmada separadamente.</p>}

      <div className="grid grid-cols-2 gap-3">
        <label className="block text-xs font-semibold text-zinc-400">
          Ordem
          <input type="number" min={0} max={9999} value={draft.sortOrder} onChange={(event) => patch("sortOrder", Number(event.target.value))} className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-[#111] px-3 text-sm text-white outline-none focus:border-primary/50" />
        </label>
        <label className="flex min-h-11 items-center gap-2 self-end rounded-xl border border-white/10 bg-[#111] px-3 text-sm font-semibold text-white">
          <input type="checkbox" checked={draft.isActive} onChange={(event) => patch("isActive", event.target.checked)} className="h-4 w-4 accent-primary" />
          Publicada na Home
        </label>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-white/[0.08] pt-4 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="min-h-11 rounded-xl border border-white/10 px-4 text-sm font-semibold text-zinc-400 hover:text-white">Cancelar</button>
        <button type="submit" disabled={busy} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground disabled:opacity-60">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}
          {busy ? "Salvando…" : "Salvar promoção"}
        </button>
      </div>
    </form>
  );
}
