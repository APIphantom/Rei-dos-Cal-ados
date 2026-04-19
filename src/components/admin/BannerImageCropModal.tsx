"use client";

import { useCallback, useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import Cropper, { type Area } from "react-easy-crop";
import { Loader2, X } from "lucide-react";
import { getHeroCroppedImageBlob } from "@/lib/hero-image-crop";
import { cn } from "@/lib/utils";

export const BANNER_CROP_ASPECT = 2.75;

type Props = {
  open: boolean;
  imageSrc: string | null;
  onOpenChange: (open: boolean) => void;
  onCropped: (file: File) => Promise<void>;
};

export function BannerImageCropModal({ open, imageSrc, onOpenChange, onCropped }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!imageSrc) return;
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  }, [imageSrc]);

  const onCropComplete = useCallback((_area: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleApply = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setBusy(true);
    try {
      const blob = await getHeroCroppedImageBlob(imageSrc, croppedAreaPixels);
      const file = new File([blob], `banner-${Date.now()}.jpg`, { type: "image/jpeg" });
      await onCropped(file);
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/85" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-[101] w-[min(96vw,900px)] max-h-[90vh] -translate-x-1/2 -translate-y-1/2",
            "rounded-2xl border border-[#2a2a2a] bg-[#0f0f0f] p-4 shadow-xl outline-none"
          )}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="font-heading text-lg font-bold text-white">
                Ajustar imagem do banner
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-zinc-500">
                Posicione e faça zoom; a proporção segue a faixa larga do bloco na loja.
              </Dialog.Description>
            </div>
            <Dialog.Close
              type="button"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#2a2a2a] text-zinc-400 hover:border-[#F59E0B]/50 hover:text-white"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          {imageSrc && (
            <div className="relative mt-4 aspect-[11/4] w-full overflow-hidden rounded-xl bg-black">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={BANNER_CROP_ASPECT}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                showGrid={false}
                objectFit="horizontal-cover"
              />
            </div>
          )}

          <div className="mt-4 space-y-2">
            <label className="flex items-center gap-3 text-xs text-zinc-400">
              <span className="w-12 shrink-0 font-bold uppercase tracking-wider">Zoom</span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="h-2 w-full cursor-pointer accent-[#F59E0B]"
              />
            </label>
          </div>

          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <Dialog.Close
              type="button"
              disabled={busy}
              className="h-11 rounded-full border border-[#2a2a2a] px-6 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:border-zinc-600 disabled:opacity-50"
            >
              Cancelar
            </Dialog.Close>
            <button
              type="button"
              disabled={busy || !imageSrc || !croppedAreaPixels}
              onClick={() => void handleApply()}
              className="inline-flex h-11 items-center justify-center rounded-full bg-[#F59E0B] px-8 text-xs font-bold uppercase tracking-wider text-black disabled:opacity-50"
            >
              {busy ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Aplicando…
                </>
              ) : (
                "Usar este recorte"
              )}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
