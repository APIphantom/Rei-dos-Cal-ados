"use client";

import { useCallback, useState, useTransition } from "react";
import { toast } from "sonner";
import { Image as ImageIcon, Loader2, Upload, Video } from "lucide-react";
import { saveHeroSettings, uploadHeroMedia } from "@/features/admin/site/actions";
import type { HeroMediaType } from "@/lib/site-settings";
import { cn } from "@/lib/utils";

const ACCEPT_IMAGE = "image/png,image/jpeg,image/jpg,image/webp,image/avif,.png,.jpg,.jpeg,.webp,.avif";
const ACCEPT_VIDEO = "video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov";

type Props = {
  initialType: HeroMediaType;
  initialUrl: string | null;
};

export function HeroSettingsForm({ initialType, initialUrl }: Props) {
  const [type, setType] = useState<HeroMediaType>(initialType);
  const [url, setUrl] = useState(initialUrl ?? "");
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);

  const uploadFile = useCallback(async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await uploadHeroMedia(fd);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    const isVideo = file.type.startsWith("video/");
    setType(isVideo ? "video" : "image");
    setUrl(res.url);
    toast.success("Arquivo enviado. Clique em Salvar para publicar na loja.");
  }, []);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (file.type.startsWith("video/")) {
      setType("video");
      setUploading(true);
      try {
        await uploadFile(file);
      } finally {
        setUploading(false);
      }
      return;
    }

    if (file.type.startsWith("image/")) {
      setType("image");
      setUploading(true);
      try {
        await uploadFile(file);
      } finally {
        setUploading(false);
      }
      return;
    }

    toast.error("Use PNG, JPG, WebP, AVIF (imagens) ou MP4, WebM, MOV (vídeo).");
  }

  function submit() {
    startTransition(async () => {
      const r = await saveHeroSettings({
        hero_media_type: type,
        hero_media_url: type === "none" ? null : url.trim() || null,
      });
      if (r.ok) {
        toast.success("Configurações do hero guardadas.");
        window.location.reload();
      } else toast.error(r.error);
    });
  }

  const showPreview = type !== "none" && url.trim().startsWith("http");
  const fileAccept = type === "video" ? ACCEPT_VIDEO : type === "image" ? ACCEPT_IMAGE : `${ACCEPT_IMAGE},${ACCEPT_VIDEO}`;

  return (
    <div className="space-y-8 rounded-2xl border border-[#2a2a2a] bg-[#0f0f0f] p-4 sm:p-8">
      <div>
        <h2 className="font-heading text-lg font-bold text-white">Mídia do hero (página inicial)</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
          Escolha o modo abaixo. O envio de ficheiro ajusta automaticamente o tipo (imagem ou vídeo). Também pode colar uma
          URL pública (https). A pré-visualização em tempo real reflete o URL atual.
        </p>
      </div>

      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Modo ativo</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
          {(
            [
              { id: "none" as const, label: "Só fundo", hint: "Gradiente sem mídia" },
              { id: "image" as const, label: "Imagem", hint: "Foto de capa" },
              { id: "video" as const, label: "Vídeo", hint: "Loop em fundo" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setType(opt.id)}
              className={cn(
                "flex min-h-[52px] flex-1 flex-col items-start rounded-xl border px-4 py-2.5 text-left transition-colors sm:min-w-[140px] sm:flex-none",
                type === opt.id
                  ? "border-[#F59E0B] bg-[#F59E0B]/15 text-[#F59E0B]"
                  : "border-[#2a2a2a] text-zinc-400 hover:border-zinc-600"
              )}
            >
              <span className="text-xs font-bold uppercase tracking-wide">{opt.label}</span>
              <span className="mt-0.5 text-[11px] text-zinc-500">{opt.hint}</span>
            </button>
          ))}
        </div>
      </div>

      {type !== "none" && (
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
          <div className="space-y-4">
            <label className="block space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">URL da mídia (https)</span>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="h-11 w-full rounded-xl border border-[#2a2a2a] bg-[#111] px-4 text-sm text-white outline-none focus:border-[#F59E0B]"
              />
            </label>

            <div>
              <input
                type="file"
                accept={fileAccept}
                className="hidden"
                id="hero-file"
                onChange={onFile}
              />
              <label htmlFor="hero-file">
                <span className="inline-flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#2a2a2a] bg-[#111] px-4 py-2.5 text-sm text-zinc-200 hover:border-[#F59E0B]/50 sm:w-auto">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {type === "video" ? "Enviar vídeo" : type === "image" ? "Enviar imagem" : "Enviar imagem ou vídeo"}
                </span>
              </label>
              <p className="mt-2 text-[11px] text-zinc-600">
                Imagens: PNG, JPG, WebP, AVIF. Vídeo: MP4, WebM ou MOV. O tipo é detetado pelo ficheiro.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Pré-visualização</p>
            <div
              className={cn(
                "relative overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[#111]",
                type === "video" ? "aspect-video" : "aspect-[21/9]"
              )}
            >
              {showPreview ? (
                type === "video" ? (
                  <video
                    key={url}
                    className="h-full w-full object-cover"
                    src={url}
                    controls
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element -- admin preview of external URL
                  <img src={url} alt="" className="h-full w-full object-cover" />
                )
              ) : (
                <div className="flex min-h-[160px] flex-col items-center justify-center gap-2 p-6 text-center text-sm text-zinc-600">
                  {type === "video" ? (
                    <Video className="h-10 w-10 opacity-40" aria-hidden />
                  ) : (
                    <ImageIcon className="h-10 w-10 opacity-40" aria-hidden />
                  )}
                  <span>Defina uma URL ou envie um ficheiro para ver a pré-visualização.</span>
                </div>
              )}
            </div>
            <p className="text-[11px] text-zinc-600">
              Na loja, o hero usa uma faixa panorâmica fixa; imagens e vídeos são enquadrados sem distorcer.
            </p>
          </div>
        </div>
      )}

      <button
        type="button"
        disabled={pending || uploading}
        onClick={submit}
        className="inline-flex h-12 min-h-[44px] w-full items-center justify-center rounded-full bg-[#F59E0B] px-8 text-xs font-bold uppercase tracking-wider text-black transition-opacity hover:opacity-95 disabled:opacity-50 sm:h-11 sm:w-auto"
      >
        {pending ? "A guardar…" : "Salvar hero"}
      </button>
    </div>
  );
}
