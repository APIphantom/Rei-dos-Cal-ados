"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import { saveHeroSettings, uploadHeroMedia } from "@/features/admin/site/actions";
import type { HeroMediaType } from "@/lib/site-settings";
import { cn } from "@/lib/utils";

type Props = {
  initialType: HeroMediaType;
  initialUrl: string | null;
};

export function HeroSettingsForm({ initialType, initialUrl }: Props) {
  const [type, setType] = useState<HeroMediaType>(initialType);
  const [url, setUrl] = useState(initialUrl ?? "");
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
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
      toast.success("Arquivo enviado. Clique em Salvar para aplicar.");
    } finally {
      setUploading(false);
    }
  }

  function submit() {
    startTransition(async () => {
      const r = await saveHeroSettings({
        hero_media_type: type,
        hero_media_url: type === "none" ? null : url.trim() || null,
      });
      if (r.ok) {
        toast.success("Hero atualizado.");
        window.location.reload();
      } else toast.error(r.error);
    });
  }

  return (
    <div className="space-y-8 rounded-2xl border border-[#2a2a2a] bg-[#0f0f0f] p-6 md:p-8">
      <div>
        <h2 className="font-heading text-lg font-bold text-white">Mídia do hero (home)</h2>
        <p className="mt-2 text-sm text-zinc-500">
          Escolha nenhuma mídia (só gradiente), imagem ou vídeo. Pode colar URL ou enviar arquivo para o Supabase
          Storage.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {(
          [
            { id: "none" as const, label: "Só gradiente" },
            { id: "image" as const, label: "Imagem" },
            { id: "video" as const, label: "Vídeo" },
          ] as const
        ).map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setType(opt.id)}
            className={cn(
              "rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors",
              type === opt.id
                ? "border-[#F59E0B] bg-[#F59E0B]/15 text-[#F59E0B]"
                : "border-[#2a2a2a] text-zinc-400 hover:border-zinc-600"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {type !== "none" && (
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
              accept="image/*,video/*"
              className="hidden"
              id="hero-file"
              onChange={onFile}
            />
            <label htmlFor="hero-file">
              <span className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#2a2a2a] bg-[#111] px-4 py-2.5 text-sm text-zinc-300 hover:border-[#F59E0B]/50">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Enviar arquivo ({type === "video" ? "vídeo" : "imagem"})
              </span>
            </label>
          </div>
        </div>
      )}

      <button
        type="button"
        disabled={pending}
        onClick={submit}
        className="inline-flex h-11 items-center justify-center rounded-full bg-[#F59E0B] px-8 text-xs font-bold uppercase tracking-wider text-black disabled:opacity-50"
      >
        {pending ? "Salvando…" : "Salvar hero"}
      </button>
    </div>
  );
}
