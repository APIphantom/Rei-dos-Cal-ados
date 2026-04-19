"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Upload } from "lucide-react";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  createProductPayload,
  updateProductPayload,
  uploadProductImage,
} from "@/features/admin/products/actions";
import { productPayloadSchema, type ProductPayload } from "@/features/admin/products/schema";
import { TagInput } from "@/components/admin/TagInput";
import { AdminImage } from "@/components/ui/admin-image";
import { cn } from "@/lib/utils";

const SHOE_SIZES = ["38", "39", "40", "41", "42", "43", "44", "45"];

const IMAGE_ACCEPT =
  "image/png,image/jpeg,image/jpg,image/webp,image/avif,.png,.jpg,.jpeg,.webp,.avif";

const EMPTY: ProductPayload = {
  brand: "",
  name: "",
  description: "",
  price: 99.9,
  category: "",
  image_url: "",
  gallery_urls: [],
  tags: [],
  sizes: [],
  colors: [],
  is_featured: false,
  is_bestseller: false,
  stock_quantity: 0,
};

function SortableGalleryItem({
  id,
  url,
  onRemove,
}: {
  id: string;
  url: string;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <li
      ref={setNodeRef}
      className={cn(
        "group relative aspect-square overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#111]",
        isDragging && "opacity-60 ring-2 ring-[#F59E0B]/70"
      )}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <AdminImage src={url} alt="" fill sizes="(max-width: 768px) 45vw, 160px" className="object-cover" />
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-2 top-2 rounded-lg bg-black/70 p-1.5 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
        aria-label="Remover"
      >
        <Trash2 className="h-4 w-4" />
      </button>
      <button
        type="button"
        className="absolute bottom-2 left-2 rounded-lg border border-white/10 bg-black/60 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-200 opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
        {...attributes}
        {...listeners}
      >
        Arrastar
      </button>
    </li>
  );
}

type Props = {
  mode: "create" | "edit";
  productId?: string;
  initialValues?: Partial<ProductPayload>;
  brandSuggestions: string[];
  categorySuggestions: string[];
};

export function ProductForm({ mode, productId, initialValues, brandSuggestions, categorySuggestions }: Props) {
  const router = useRouter();
  const mainInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [mainPreview, setMainPreview] = useState<string | null>(null);
  const [queuedGallery, setQueuedGallery] = useState<{ id: string; file: File; preview: string }[]>([]);
  const [colorName, setColorName] = useState("");
  const [colorHex, setColorHex] = useState("#111111");
  const [dragMain, setDragMain] = useState(false);
  const [dragGallery, setDragGallery] = useState(false);

  const merged: ProductPayload = { ...EMPTY, ...initialValues };

  const form = useForm<ProductPayload>({
    resolver: zodResolver(productPayloadSchema),
    defaultValues: merged,
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    getValues,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = form;

  const imageUrl = watch("image_url");
  const galleryUrls = watch("gallery_urls") ?? [];
  const mainDisplay = mainPreview || imageUrl;
  const colors = watch("colors") ?? [];
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  useEffect(() => {
    if (!isDirty) return;
    function onBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  async function runUpload(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await uploadProductImage(fd);
    if (!res.ok) {
      toast.error(res.error);
      return null;
    }
    return res.url;
  }

  async function processMainFile(file: File) {
    const blob = URL.createObjectURL(file);
    setMainPreview(blob);
    setUploadingMain(true);
    try {
      const url = await runUpload(file);
      if (url) {
        setValue("image_url", url, { shouldValidate: true });
        toast.success("Imagem principal enviada.");
      }
    } finally {
      URL.revokeObjectURL(blob);
      setMainPreview(null);
      setUploadingMain(false);
    }
  }

  async function onMainFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    await processMainFile(file);
  }

  async function onGalleryFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    enqueueGalleryFiles(files);
  }

  function enqueueGalleryFiles(files: File[]) {
    const list = files.filter((f) => f.type.startsWith("image/"));
    if (!list.length) {
      toast.error("Selecione imagens para a galeria.");
      return;
    }

    const next = list.map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
    }));
    setQueuedGallery((q) => [...q, ...next]);
    toast.success(`${next.length} imagem(ns) pronta(s) para envio.`);
  }

  async function uploadQueuedGallery() {
    if (!queuedGallery.length) return;
    setUploadingGallery(true);
    const nextUrls: string[] = [...(getValues("gallery_urls") ?? [])];
    try {
      for (const slot of queuedGallery) {
        const url = await runUpload(slot.file);
        if (url) nextUrls.push(url);
      }
      setValue("gallery_urls", nextUrls, { shouldValidate: true, shouldDirty: true });
      setQueuedGallery((q) => {
        q.forEach((x) => URL.revokeObjectURL(x.preview));
        return [];
      });
      toast.success("Galeria enviada.");
    } finally {
      setUploadingGallery(false);
    }
  }

  function addColor() {
    const n = colorName.trim();
    if (!n) {
      toast.error("Informe o nome da cor.");
      return;
    }
    setValue("colors", [...colors, { name: n, hex: colorHex }], { shouldValidate: true });
    setColorName("");
    setColorHex("#111111");
  }

  function removeColor(i: number) {
    setValue(
      "colors",
      colors.filter((_, j) => j !== i),
      { shouldValidate: true }
    );
  }

  function toggleSize(s: string) {
    const sizes = watch("sizes") ?? [];
    if (sizes.includes(s)) {
      setValue(
        "sizes",
        sizes.filter((x) => x !== s),
        { shouldValidate: true }
      );
    } else {
      setValue("sizes", [...sizes, s].sort((a, b) => Number(a) - Number(b)), { shouldValidate: true });
    }
  }

  const onValid = async (data: ProductPayload) => {
    if (mode === "create") {
      const r = await createProductPayload(data);
      if (r.ok) {
        toast.success("Produto criado.");
        router.push("/admin/products");
        router.refresh();
      } else toast.error(r.error);
    } else if (productId) {
      const r = await updateProductPayload(productId, data);
      if (r.ok) {
        toast.success("Produto atualizado.");
        router.refresh();
      } else toast.error(r.error);
    }
  };

  function onCancel() {
    if (isDirty && !confirm("Você tem alterações não salvas. Deseja sair mesmo assim?")) return;
    router.push("/admin/products");
  }

  function onGalleryDragEnd(ev: DragEndEvent) {
    const { active, over } = ev;
    if (!over || active.id === over.id) return;
    const ids = galleryUrls.map((url) => `g:${url}`);
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from < 0 || to < 0) return;
    setValue("gallery_urls", arrayMove(galleryUrls, from, to), { shouldValidate: true, shouldDirty: true });
  }

  function onQueueDragEnd(ev: DragEndEvent) {
    const { active, over } = ev;
    if (!over || active.id === over.id) return;
    const ids = queuedGallery.map((x) => `q:${x.id}`);
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from < 0 || to < 0) return;
    setQueuedGallery((q) => arrayMove(q, from, to));
  }

  return (
    <>
      <form id="admin-product-form" onSubmit={handleSubmit(onValid)} className="space-y-10 pb-40 md:pb-32">
        <section className="rounded-2xl border border-[#2a2a2a] bg-[#0f0f0f] p-6 md:p-8">
          <h2 className="font-heading text-lg font-bold text-white">Informações básicas</h2>
          <p className="mt-1 text-sm text-zinc-500">Nome, preço, marca e categoria.</p>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Nome do produto</label>
              <input
                {...register("name")}
                className="h-12 w-full rounded-xl border border-[#2a2a2a] bg-[#111] px-4 text-sm text-white outline-none focus:border-[#F59E0B]"
              />
              {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Marca</label>
              <input
                {...register("brand")}
                list="brand-suggestions"
                className="h-12 w-full rounded-xl border border-[#2a2a2a] bg-[#111] px-4 text-sm text-white outline-none focus:border-[#F59E0B]"
              />
              <datalist id="brand-suggestions">
                {brandSuggestions.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Tipo de produto</label>
              <input
                {...register("category")}
                list="category-suggestions"
                placeholder="Ex.: Tênis, Sandália…"
                className="h-12 w-full rounded-xl border border-[#2a2a2a] bg-[#111] px-4 text-sm text-white outline-none focus:border-[#F59E0B]"
              />
              <datalist id="category-suggestions">
                {categorySuggestions.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Preço (R$)</label>
              <input
                type="number"
                step="0.01"
                min={0.01}
                {...register("price", { valueAsNumber: true })}
                className="h-12 w-full rounded-xl border border-[#2a2a2a] bg-[#111] px-4 text-sm text-white outline-none focus:border-[#F59E0B]"
              />
              {errors.price && <p className="text-xs text-red-400">{errors.price.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Estoque (unidades)</label>
              <input
                type="number"
                min={0}
                step={1}
                {...register("stock_quantity", { valueAsNumber: true })}
                className="h-12 w-full rounded-xl border border-[#2a2a2a] bg-[#111] px-4 text-sm text-white outline-none focus:border-[#F59E0B]"
              />
              {errors.stock_quantity && (
                <p className="text-xs text-red-400">{errors.stock_quantity.message}</p>
              )}
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Descrição</label>
              <textarea
                {...register("description")}
                rows={5}
                className="w-full rounded-xl border border-[#2a2a2a] bg-[#111] px-4 py-3 text-sm text-white outline-none focus:border-[#F59E0B]"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Etiquetas</label>
              <Controller
                name="tags"
                control={control}
                render={({ field }) => (
                  <TagInput value={field.value ?? []} onChange={field.onChange} placeholder="Ex.: Esportivo, Promoção" />
                )}
              />
            </div>

            <div className="flex flex-wrap gap-6 md:col-span-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
                <input type="checkbox" {...register("is_featured")} className="rounded border-[#2a2a2a]" />
                Destaque na home
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
                <input type="checkbox" {...register("is_bestseller")} className="rounded border-[#2a2a2a]" />
                Mais vendido
              </label>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[#2a2a2a] bg-[#0f0f0f] p-6 md:p-8">
          <h2 className="font-heading text-lg font-bold text-white">Variações</h2>
          <p className="mt-1 text-sm text-zinc-500">Tamanhos e cores disponíveis.</p>

          <div className="mt-6 space-y-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Tamanhos</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {SHOE_SIZES.map((s) => {
                  const active = (watch("sizes") ?? []).includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSize(s)}
                      className={cn(
                        "h-10 min-w-[44px] rounded-xl border px-3 text-sm font-semibold transition-colors",
                        active
                          ? "border-[#F59E0B] bg-[#F59E0B]/15 text-[#F59E0B]"
                          : "border-[#2a2a2a] bg-[#111] text-zinc-400 hover:border-zinc-600"
                      )}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Cores</p>
              <div className="mt-3 flex flex-wrap items-end gap-3">
                <input
                  value={colorName}
                  onChange={(e) => setColorName(e.target.value)}
                  placeholder="Nome (ex.: Preto)"
                  className="h-10 flex-1 min-w-[140px] rounded-xl border border-[#2a2a2a] bg-[#111] px-3 text-sm text-white outline-none focus:border-[#F59E0B]"
                />
                <input
                  type="color"
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  className="h-10 w-16 cursor-pointer rounded-lg border border-[#2a2a2a] bg-[#111] p-1"
                  aria-label="Cor"
                />
                <button
                  type="button"
                  onClick={addColor}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#F59E0B] bg-[#F59E0B]/10 px-4 text-sm font-semibold text-[#F59E0B] transition-colors hover:bg-[#F59E0B]/20"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar cor
                </button>
              </div>
              {colors.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {colors.map((c, i) => (
                    <li
                      key={`${c.name}-${i}`}
                      className="flex items-center gap-2 rounded-xl border border-[#2a2a2a] bg-[#111] py-1.5 pl-3 pr-2 text-sm text-zinc-200"
                    >
                      <span className="h-4 w-4 rounded-full border border-white/20" style={{ backgroundColor: c.hex }} />
                      {c.name}
                      <button type="button" onClick={() => removeColor(i)} className="p-1 text-zinc-500 hover:text-red-400">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[#2a2a2a] bg-[#0f0f0f] p-6 md:p-8">
          <h2 className="font-heading text-lg font-bold text-white">Imagens</h2>
          <p className="mt-1 text-sm text-zinc-500">Envie do computador ou cole URL da imagem principal.</p>

          <div className="mt-6 grid gap-8 lg:grid-cols-2">
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Imagem principal</p>
              <div
                className={cn(
                  "relative aspect-[3/4] max-h-[320px] overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[#111] transition-shadow",
                  dragMain && "ring-2 ring-[#F59E0B] ring-offset-2 ring-offset-[#0f0f0f]"
                )}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragMain(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                  setDragMain(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragMain(false);
                  const f = e.dataTransfer.files?.[0];
                  if (f) void processMainFile(f);
                }}
              >
                {mainDisplay ? (
                  <AdminImage
                    src={mainDisplay}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 100vw, 400px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full min-h-[200px] items-center justify-center text-sm text-zinc-600">
                    Nenhuma imagem
                  </div>
                )}
              </div>
              <input ref={mainInputRef} type="file" accept={IMAGE_ACCEPT} className="hidden" onChange={onMainFile} />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={uploadingMain}
                  onClick={() => mainInputRef.current?.click()}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#F59E0B] px-4 text-sm font-bold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {uploadingMain ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Enviar imagem
                </button>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-zinc-500">Ou URL da imagem principal</label>
                <input
                  {...register("image_url")}
                  placeholder="https://..."
                  className="h-11 w-full rounded-xl border border-[#2a2a2a] bg-[#111] px-3 text-sm text-white outline-none focus:border-[#F59E0B]"
                />
                {errors.image_url && <p className="text-xs text-red-400">{errors.image_url.message}</p>}
              </div>
            </div>

            <div
              className={cn("space-y-3 rounded-2xl border border-transparent p-1 transition-colors", dragGallery && "border-[#F59E0B]/50 bg-[#F59E0B]/5")}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragGallery(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                setDragGallery(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setDragGallery(false);
                const list = Array.from(e.dataTransfer.files ?? []).filter((f) => f.type.startsWith("image/"));
                enqueueGalleryFiles(list);
              }}
            >
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Galeria (opcional)</p>
              <p className="text-[11px] text-zinc-600">Arraste imagens aqui. Revise e reordene antes de enviar.</p>
              <input ref={galleryInputRef} type="file" accept={IMAGE_ACCEPT} multiple className="hidden" onChange={onGalleryFiles} />
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={uploadingGallery}
                  onClick={() => galleryInputRef.current?.click()}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#2a2a2a] bg-[#111] px-4 text-sm font-semibold text-zinc-200 transition-colors hover:border-[#F59E0B]/50 disabled:opacity-50 md:w-auto"
                >
                  <Upload className="h-4 w-4" />
                  Selecionar imagens
                </button>
                <button
                  type="button"
                  disabled={uploadingGallery || queuedGallery.length === 0}
                  onClick={() => void uploadQueuedGallery()}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#F59E0B] px-4 text-sm font-bold text-black transition-opacity hover:opacity-90 disabled:opacity-50 md:w-auto"
                >
                  {uploadingGallery ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Enviar selecionadas ({queuedGallery.length})
                </button>
              </div>

              {queuedGallery.length > 0 && (
                <div className="rounded-xl border border-[#2a2a2a] bg-[#0a0a0a] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                    Pré-envio (arraste para ordenar)
                  </p>
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onQueueDragEnd}>
                    <SortableContext items={queuedGallery.map((x) => `q:${x.id}`)} strategy={rectSortingStrategy}>
                      <ul className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
                        {queuedGallery.map((slot) => (
                          <li
                            key={slot.id}
                            className="group relative aspect-square overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#111]"
                          >
                            <Image src={slot.preview} alt="" fill className="object-cover" unoptimized />
                            <button
                              type="button"
                              onClick={() =>
                                setQueuedGallery((q) => {
                                  const found = q.find((x) => x.id === slot.id);
                                  if (found) URL.revokeObjectURL(found.preview);
                                  return q.filter((x) => x.id !== slot.id);
                                })
                              }
                              className="absolute right-2 top-2 rounded-lg bg-black/70 p-1.5 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                              aria-label="Remover do envio"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </SortableContext>
                  </DndContext>
                </div>
              )}
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onGalleryDragEnd}>
                <SortableContext items={galleryUrls.map((u) => `g:${u}`)} strategy={rectSortingStrategy}>
                  <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {galleryUrls.map((url) => (
                      <SortableGalleryItem
                        key={url}
                        id={`g:${url}`}
                        url={url}
                        onRemove={() =>
                          setValue(
                            "gallery_urls",
                            galleryUrls.filter((u) => u !== url),
                            { shouldValidate: true, shouldDirty: true }
                          )
                        }
                      />
                    ))}
                  </ul>
                </SortableContext>
              </DndContext>
            </div>
          </div>
        </section>
      </form>

      <div className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] left-0 right-0 z-40 border-t border-[#2a2a2a] bg-[#0a0a0a]/95 px-3 py-3 backdrop-blur-md md:bottom-0 md:left-[var(--admin-sidebar-width,16rem)] md:px-4 md:py-4">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <p className="hidden text-sm text-zinc-500 sm:block">
            {mode === "create" ? "Novo produto" : "Edição"} — alterações não salvas até confirmar.
          </p>
          <div className="flex w-full gap-2 sm:ml-auto sm:w-auto sm:gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="h-12 flex-1 rounded-xl border border-[#2a2a2a] px-4 text-sm font-semibold text-zinc-300 hover:bg-white/5 sm:flex-none sm:px-6"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="admin-product-form"
              disabled={isSubmitting}
              className="inline-flex h-12 min-w-0 flex-1 items-center justify-center rounded-xl bg-[#F59E0B] px-4 text-sm font-bold text-black transition-opacity hover:opacity-90 disabled:opacity-50 sm:min-w-[160px] sm:flex-none sm:px-8"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando…
                </>
              ) : (
                "Salvar produto"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
