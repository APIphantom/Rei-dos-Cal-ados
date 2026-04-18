"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";
import { HomeHeroClient, type HeroMedia } from "@/components/home/HomeHeroClient";
import { PromoBannerClient } from "@/components/home/PromoBannerClient";
import { ThemeColorField } from "@/components/admin/ThemeColorField";
import {
  HERO_UI_DEFAULTS,
  flushHeroUiPersistence,
  useHeroUiStore,
  type HeroTextAlign,
} from "@/features/storefront/hero-ui-store";
import {
  BANNER_UI_DEFAULTS,
  flushBannerUiPersistence,
  useBannerUiStore,
} from "@/features/storefront/banner-ui-store";
import { fileToCompressedJpegDataUrl } from "@/lib/compress-image";
import { BannerImageCropModal } from "@/components/admin/BannerImageCropModal";
import {
  DESKTOP_PREVIEW_SCALE,
  DESKTOP_PREVIEW_WIDTH_PX,
  ScaledDesktopPreview,
} from "@/components/admin/ScaledDesktopPreview";

type TabKey = "hero" | "banner";

const PREVIEW_IMAGE_SIZES = `(max-width: ${DESKTOP_PREVIEW_WIDTH_PX}px) 100vw, ${DESKTOP_PREVIEW_WIDTH_PX}px`;

export function CustomizeWorkspace({ heroMedia }: { heroMedia: HeroMedia }) {
  const [tab, setTab] = useState<TabKey>("hero");
  const [bannerCropOpen, setBannerCropOpen] = useState(false);
  const [bannerCropSrc, setBannerCropSrc] = useState<string | null>(null);
  const heroPatch = useHeroUiStore((s) => s.patch);
  const heroReset = useHeroUiStore((s) => s.reset);
  const setHeroImage = useHeroUiStore((s) => s.setImageOverride);
  const hero = useHeroUiStore();

  const bannerPatch = useBannerUiStore((s) => s.patch);
  const bannerReset = useBannerUiStore((s) => s.reset);
  const setBannerImage = useBannerUiStore((s) => s.setBannerImage);
  const banner = useBannerUiStore();

  const bannerInput = useRef<HTMLInputElement>(null);
  const heroInput = useRef<HTMLInputElement>(null);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#F59E0B]">Loja</p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight md:text-4xl">Customização</h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-500">
            Ajuste overlay, textos e posição (arraste o bloco na pré-visualização). As mudanças são gravadas
            automaticamente; use <strong className="font-semibold text-zinc-400">Salvar</strong> para confirmar e forçar
            gravação no armazenamento local.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              flushHeroUiPersistence();
              flushBannerUiPersistence();
              toast.success("Configuração salva neste navegador.");
            }}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#F59E0B] px-5 text-sm font-bold text-black transition-opacity hover:opacity-90"
          >
            <Save className="h-4 w-4" />
            Salvar
          </button>
          <Link
            href="/admin"
            className="text-sm font-medium text-zinc-500 underline-offset-4 transition-colors hover:text-[#F59E0B]"
          >
            ← Voltar ao painel
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl border border-[#2a2a2a] bg-[#0a0a0a] p-1">
        {(["hero", "banner"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors ${
              tab === k ? "bg-[#F59E0B] text-black" : "text-zinc-400 hover:text-white"
            }`}
          >
            {k === "hero" ? "Hero" : "Banner"}
          </button>
        ))}
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <motion.aside
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6 rounded-2xl border border-[#2a2a2a] bg-[#0f0f0f] p-6"
        >
          {tab === "hero" ? (
            <>
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-heading text-lg font-bold">Hero</h2>
                <button
                  type="button"
                  onClick={() => heroReset()}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#2a2a2a] px-3 py-1.5 text-xs font-semibold text-zinc-300 transition-colors hover:border-[#F59E0B]/40"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Resetar padrão
                </button>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Imagem local</p>
                <input
                  ref={heroInput}
                  type="file"
                  accept="image/*"
                  className="mt-2 w-full cursor-pointer text-sm text-zinc-400 file:mr-3 file:rounded-lg file:border-0 file:bg-[#111] file:px-3 file:py-2 file:text-xs file:font-bold file:text-[#F59E0B]"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    e.target.value = "";
                    if (!f) return;
                    void (async () => {
                      try {
                        const { dataUrl, width, height } = await fileToCompressedJpegDataUrl(f);
                        setHeroImage(dataUrl, true, { width, height });
                        toast.success("Imagem do hero aplicada (proporção original, sem recorte).");
                      } catch {
                        toast.error("Não foi possível processar a imagem. Tente um ficheiro menor ou outro formato.");
                      }
                    })();
                  }}
                />
                <p className="mt-2 text-[11px] leading-relaxed text-zinc-600">
                  A secção do hero acompanha a <strong className="font-semibold text-zinc-500">proporção da imagem</strong> (largura
                  total, altura automática, sem distorção). Para ficheiro no servidor em alta resolução:{" "}
                  <strong className="font-semibold text-zinc-500">Admin → Configurações</strong>.
                </p>
                <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-zinc-400">
                  <input
                    type="checkbox"
                    checked={hero.useImageOverride}
                    onChange={(e) => setHeroImage(hero.imageOverride, e.target.checked)}
                    className="rounded border-[#2a2a2a] bg-[#111]"
                  />
                  Usar imagem enviada em vez da mídia do servidor
                </label>
                <button
                  type="button"
                  className="mt-2 text-xs font-semibold text-red-400/90 hover:text-red-300"
                  onClick={() => {
                    setHeroImage(null, false);
                    if (heroInput.current) heroInput.current.value = "";
                  }}
                >
                  Limpar imagem local
                </button>
              </div>

              <HeroImageHint />

              {heroMedia.type === "video" && !hero.useImageOverride ? (
                <FocalPresetRow
                  label="Foco do vídeo no hero"
                  description="object-position quando o vídeo preenche a área fixa (recorte lateral ou vertical)."
                  presets={[
                    { label: "Superior", value: "50% 32%" },
                    { label: "Equilíbrio", value: "50% 42%" },
                    { label: "Centro", value: "50% 50%" },
                    { label: "Inferior", value: "50% 65%" },
                    { label: "Base", value: "50% 78%" },
                  ]}
                  value={hero.imageObjectPosition}
                  onSelect={(imageObjectPosition) => heroPatch({ imageObjectPosition })}
                />
              ) : null}

              <FieldRange
                label="Opacidade do overlay"
                min={0}
                max={100}
                value={Math.round(hero.overlayOpacity * 100)}
                onChange={(v) => heroPatch({ overlayOpacity: v / 100 })}
              />
              <p className="-mt-1 text-[11px] text-zinc-600">
                Use <strong className="font-semibold text-zinc-500">0%</strong> para ver só a imagem (sem escurecimento). Desative
                abaixo o gradiente linear para overlay sólido quando precisar de contraste.
              </p>
              <FieldColor
                label="Cor (modo sólido)"
                value={hero.overlayColor}
                onChange={(overlayColor) => heroPatch({ overlayColor })}
              />
              <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={hero.gradientEnabled}
                  onChange={(e) => heroPatch({ gradientEnabled: e.target.checked })}
                  className="rounded border-[#2a2a2a] bg-[#111]"
                />
                Gradiente linear no overlay (desative para cor única)
              </label>
              {hero.gradientEnabled && (
                <>
                  <FieldRange
                    label="Ângulo (°)"
                    min={0}
                    max={360}
                    value={hero.gradientAngle}
                    onChange={(gradientAngle) => heroPatch({ gradientAngle })}
                  />
                  <FieldColor
                    label="Gradiente — início"
                    value={hero.gradientFrom}
                    onChange={(gradientFrom) => heroPatch({ gradientFrom })}
                  />
                  <FieldColor
                    label="Gradiente — fim"
                    value={hero.gradientTo}
                    onChange={(gradientTo) => heroPatch({ gradientTo })}
                  />
                </>
              )}

              <FieldText label="Eyebrow" value={hero.eyebrow} onChange={(eyebrow) => heroPatch({ eyebrow })} />
              <FieldText label="Título" value={hero.headline} onChange={(headline) => heroPatch({ headline })} />
              <FieldText label="Subtítulo" value={hero.subline} onChange={(subline) => heroPatch({ subline })} />
              <div className="grid grid-cols-2 gap-3">
                <FieldText
                  label="Botão primário"
                  value={hero.primaryLabel}
                  onChange={(primaryLabel) => heroPatch({ primaryLabel })}
                />
                <FieldText
                  label="Link secundário"
                  value={hero.secondaryLabel}
                  onChange={(secondaryLabel) => heroPatch({ secondaryLabel })}
                />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Alinhamento</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(["left", "center", "right"] as HeroTextAlign[]).map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => heroPatch({ textAlign: a })}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${
                        hero.textAlign === a ? "bg-[#F59E0B] text-black" : "border border-[#2a2a2a] text-zinc-400"
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <FieldRange
                label="Título — tamanho (px)"
                min={22}
                max={56}
                value={hero.headlineSizePx}
                onChange={(headlineSizePx) => heroPatch({ headlineSizePx })}
              />
              <FieldRange
                label="Peso do título"
                min={400}
                max={700}
                step={100}
                value={hero.headlineWeight}
                onChange={(headlineWeight) => heroPatch({ headlineWeight: headlineWeight as 400 | 500 | 600 | 700 })}
              />

              <p className="border-t border-[#2a2a2a] pt-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Cores do texto e botões
              </p>
              <ThemeColorField
                label="Cor do eyebrow"
                value={hero.eyebrowColor}
                onChange={(eyebrowColor) => heroPatch({ eyebrowColor })}
                themeDefault={HERO_UI_DEFAULTS.eyebrowColor}
              />
              <ThemeColorField
                label="Cor do título"
                value={hero.headlineColor}
                onChange={(headlineColor) => heroPatch({ headlineColor })}
                themeDefault={HERO_UI_DEFAULTS.headlineColor}
              />
              <ThemeColorField
                label="Cor do subtítulo"
                value={hero.sublineColor}
                onChange={(sublineColor) => heroPatch({ sublineColor })}
                themeDefault={HERO_UI_DEFAULTS.sublineColor}
              />
              <ThemeColorField
                label="Botão principal — fundo (CTA)"
                description="Cor de fundo do botão &quot;Ver coleção&quot;."
                value={hero.ctaBackgroundColor}
                onChange={(ctaBackgroundColor) => heroPatch({ ctaBackgroundColor })}
                themeDefault={HERO_UI_DEFAULTS.ctaBackgroundColor}
              />
              <ThemeColorField
                label="Botão principal — texto (CTA)"
                value={hero.ctaForegroundColor}
                onChange={(ctaForegroundColor) => heroPatch({ ctaForegroundColor })}
                themeDefault={HERO_UI_DEFAULTS.ctaForegroundColor}
              />
              <ThemeColorField
                label="Link secundário"
                value={hero.secondaryLinkColor}
                onChange={(secondaryLinkColor) => heroPatch({ secondaryLinkColor })}
                themeDefault={HERO_UI_DEFAULTS.secondaryLinkColor}
              />
            </>
          ) : (
            <>
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-heading text-lg font-bold">Banner</h2>
                <button
                  type="button"
                  onClick={() => bannerReset()}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#2a2a2a] px-3 py-1.5 text-xs font-semibold text-zinc-300 transition-colors hover:border-[#F59E0B]/40"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Resetar padrão
                </button>
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={banner.enabled}
                  onChange={(e) => bannerPatch({ enabled: e.target.checked })}
                  className="rounded border-[#2a2a2a] bg-[#111]"
                />
                Exibir banner na home
              </label>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Imagem</p>
                <input
                  ref={bannerInput}
                  type="file"
                  accept="image/*"
                  className="mt-2 w-full cursor-pointer text-sm text-zinc-400 file:mr-3 file:rounded-lg file:border-0 file:bg-[#111] file:px-3 file:py-2 file:text-xs file:font-bold file:text-[#F59E0B]"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    e.target.value = "";
                    if (!f) return;
                    const url = URL.createObjectURL(f);
                    setBannerCropSrc(url);
                    setBannerCropOpen(true);
                  }}
                />
                <p className="mt-2 text-[11px] leading-relaxed text-zinc-600">
                  Depois do recorte (proporção do banner), a imagem é otimizada em JPEG para o armazenamento local.
                </p>
                <button
                  type="button"
                  className="mt-2 text-xs font-semibold text-red-400/90 hover:text-red-300"
                  onClick={() => {
                    setBannerImage(null);
                    if (bannerInput.current) bannerInput.current.value = "";
                  }}
                >
                  Remover imagem
                </button>
              </div>

              <BannerIdealSizeInfo />

              <FocalPresetRow
                label="Foco do recorte do banner"
                description="Mesmo ajuste do hero: controla o ponto de ancoragem da imagem no espaço visível."
                presets={[
                  { label: "Superior", value: "50% 35%" },
                  { label: "Meio-alto", value: "50% 45%" },
                  { label: "Centro", value: "50% 50%" },
                  { label: "Inferior", value: "50% 62%" },
                ]}
                value={banner.imageObjectPosition}
                onSelect={(imageObjectPosition) => bannerPatch({ imageObjectPosition })}
              />

              <FieldRange
                label="Opacidade overlay"
                min={0}
                max={100}
                value={Math.round(banner.overlayOpacity * 100)}
                onChange={(v) => bannerPatch({ overlayOpacity: v / 100 })}
              />
              <FieldColor
                label="Cor (sólido)"
                value={banner.overlayColor}
                onChange={(overlayColor) => bannerPatch({ overlayColor })}
              />
              <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={banner.gradientEnabled}
                  onChange={(e) => bannerPatch({ gradientEnabled: e.target.checked })}
                  className="rounded border-[#2a2a2a] bg-[#111]"
                />
                Gradiente no overlay
              </label>
              {banner.gradientEnabled && (
                <>
                  <FieldRange
                    label="Ângulo"
                    min={0}
                    max={360}
                    value={banner.gradientAngle}
                    onChange={(gradientAngle) => bannerPatch({ gradientAngle })}
                  />
                  <FieldColor
                    label="Gradiente início"
                    value={banner.gradientFrom}
                    onChange={(gradientFrom) => bannerPatch({ gradientFrom })}
                  />
                  <FieldColor
                    label="Gradiente fim"
                    value={banner.gradientTo}
                    onChange={(gradientTo) => bannerPatch({ gradientTo })}
                  />
                </>
              )}

              <FieldText label="Eyebrow" value={banner.eyebrow} onChange={(eyebrow) => bannerPatch({ eyebrow })} />
              <FieldText label="Título" value={banner.headline} onChange={(headline) => bannerPatch({ headline })} />
              <FieldText label="Subtítulo" value={banner.subline} onChange={(subline) => bannerPatch({ subline })} />

              <p className="border-t border-[#2a2a2a] pt-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Cores do texto e botão
              </p>
              <ThemeColorField
                label="Cor do eyebrow"
                value={banner.eyebrowColor}
                onChange={(eyebrowColor) => bannerPatch({ eyebrowColor })}
                themeDefault={BANNER_UI_DEFAULTS.eyebrowColor}
              />
              <ThemeColorField
                label="Cor do título"
                value={banner.headlineColor}
                onChange={(headlineColor) => bannerPatch({ headlineColor })}
                themeDefault={BANNER_UI_DEFAULTS.headlineColor}
              />
              <ThemeColorField
                label="Cor do subtítulo"
                value={banner.sublineColor}
                onChange={(sublineColor) => bannerPatch({ sublineColor })}
                themeDefault={BANNER_UI_DEFAULTS.sublineColor}
              />
              <ThemeColorField
                label="Botão — fundo (CTA)"
                value={banner.ctaBackgroundColor}
                onChange={(ctaBackgroundColor) => bannerPatch({ ctaBackgroundColor })}
                themeDefault={BANNER_UI_DEFAULTS.ctaBackgroundColor}
              />
              <ThemeColorField
                label="Botão — texto (CTA)"
                value={banner.ctaForegroundColor}
                onChange={(ctaForegroundColor) => bannerPatch({ ctaForegroundColor })}
                themeDefault={BANNER_UI_DEFAULTS.ctaForegroundColor}
              />

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Alinhamento</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(["left", "center", "right"] as HeroTextAlign[]).map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => bannerPatch({ textAlign: a })}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${
                        banner.textAlign === a ? "bg-[#F59E0B] text-black" : "border border-[#2a2a2a] text-zinc-400"
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </motion.aside>

        <div className="overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[#080808] shadow-2xl">
          <div className="border-b border-[#2a2a2a] px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
            Pré-visualização · arraste o conteúdo {tab === "hero" ? "do hero" : "do banner"}
            <span className="ml-2 font-normal normal-case tracking-normal text-zinc-600">
              Largura lógica {DESKTOP_PREVIEW_WIDTH_PX}px · escala {Math.round(DESKTOP_PREVIEW_SCALE * 100)}%
            </span>
          </div>
          <div className="max-h-[min(90vh,920px)] overflow-x-auto overflow-y-auto overscroll-contain">
            <div className="flex min-w-0 justify-center bg-[#050505] px-2 py-4">
              <ScaledDesktopPreview>
                {tab === "hero" ? (
                  <div className="border-b border-border/30 bg-background text-foreground">
                    <HomeHeroClient
                      hero={heroMedia}
                      interactive={false}
                      editable
                      heroImageSizes={PREVIEW_IMAGE_SIZES}
                    />
                  </div>
                ) : (
                  <div className="bg-background text-foreground">
                    <PromoBannerClient interactive={false} editable bannerImageSizes={PREVIEW_IMAGE_SIZES} />
                  </div>
                )}
              </ScaledDesktopPreview>
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-zinc-600">
        Valores padrão (referência):{" "}
        <code className="rounded bg-[#111] px-1 py-0.5 text-[10px]">{JSON.stringify(HERO_UI_DEFAULTS).slice(0, 80)}…</code>{" "}
        / banner:{" "}
        <code className="rounded bg-[#111] px-1 py-0.5 text-[10px]">{JSON.stringify(BANNER_UI_DEFAULTS).slice(0, 80)}…</code>
      </p>

      <BannerImageCropModal
        open={bannerCropOpen}
        imageSrc={bannerCropSrc}
        onOpenChange={(open) => {
          setBannerCropOpen(open);
          if (!open && bannerCropSrc) {
            URL.revokeObjectURL(bannerCropSrc);
            setBannerCropSrc(null);
          }
        }}
        onCropped={async (file) => {
          try {
            const { dataUrl } = await fileToCompressedJpegDataUrl(file);
            setBannerImage(dataUrl);
            bannerPatch({ enabled: true });
            toast.success("Imagem do banner aplicada (recorte otimizado).");
          } catch {
            toast.error("Não foi possível processar a imagem após o recorte.");
          }
        }}
      />
    </div>
  );
}

function HeroImageHint() {
  return (
    <div className="rounded-xl border border-[#2a2a2a] bg-[#0a0a0a] p-4 text-xs leading-relaxed text-zinc-400">
      <p className="font-semibold text-zinc-300">Imagem do hero (local ou servidor)</p>
      <ul className="mt-2 list-inside list-disc space-y-1.5">
        <li>
          A altura da secção segue a <strong className="text-zinc-300">proporção da imagem</strong> (largura 100% da loja, sem
          esticar nem cortar).
        </li>
        <li>
          O envio local é comprimido (lado máx. 1920px) para caber no armazenamento do navegador; a proporção mantém-se.
        </li>
      </ul>
    </div>
  );
}

function BannerIdealSizeInfo() {
  return (
    <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.07] p-4 text-xs leading-relaxed text-zinc-400">
      <p className="font-semibold text-amber-200/95">Tamanho ideal do arquivo (banner)</p>
      <ul className="mt-2 list-inside list-disc space-y-1.5">
        <li>
          <strong className="text-zinc-300">Envio local:</strong> o modal fixa a proporção da faixa do banner (~11∶4). Use fotos
          em <strong className="text-zinc-300">paisagem</strong>; evite formatos muito verticais.
        </li>
        <li>
          <strong className="text-zinc-300">Referência de proporção:</strong> panorama entre{" "}
          <strong className="text-zinc-300">21∶9 e 16∶9</strong> costuma funcionar bem como origem antes do recorte.
        </li>
        <li>
          <strong className="text-zinc-300">Resolução sugerida:</strong>{" "}
          <strong className="text-zinc-300">1920 × 640 px</strong> ou <strong className="text-zinc-300">2400 × 800 px</strong>{" "}
          (boa nitidez em telas retina).
        </li>
        <li>
          <strong className="text-zinc-300">Peso:</strong> prefira WebP ou JPEG otimizado, em geral{" "}
          <strong className="text-zinc-300">400–600 KB</strong> ou menos.
        </li>
        <li>
          <strong className="text-zinc-300">Composição:</strong> deixe o assunto principal na região central; reserve margens
          laterais seguras (~8–10%) para evitar corte em telas estreitas.
        </li>
      </ul>
    </div>
  );
}

function FocalPresetRow({
  label,
  description,
  presets,
  value,
  onSelect,
}: {
  label: string;
  description: string;
  presets: { label: string; value: string }[];
  value: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-1 text-[11px] text-zinc-600">{description}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {presets.map((p) => {
          const active = value.trim() === p.value.trim();
          return (
            <button
              key={p.value}
              type="button"
              onClick={() => onSelect(p.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                active ? "bg-[#F59E0B] text-black" : "border border-[#2a2a2a] text-zinc-400 hover:border-[#F59E0B]/35"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>
      <p className="mt-2 font-mono text-[10px] text-zinc-600">Atual: {value}</p>
    </div>
  );
}

function FieldRange({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-zinc-500">
        <span>{label}</span>
        <span className="text-zinc-400">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-[#F59E0B]"
      />
    </div>
  );
}

function FieldColor({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const hex = isLikelyHex(value) ? value : "#000000";
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</p>
      <div className="mt-2 flex gap-2">
        {isLikelyHex(value) && (
          <input
            type="color"
            value={hex}
            onChange={(e) => onChange(e.target.value)}
            className="h-10 w-14 shrink-0 cursor-pointer rounded border border-[#2a2a2a] bg-transparent"
          />
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-w-0 flex-1 rounded-xl border border-[#2a2a2a] bg-[#111] px-3 py-2 font-mono text-sm outline-none focus:border-[#F59E0B]/50"
          placeholder="#000 ou rgba(...)"
        />
      </div>
    </div>
  );
}

function isLikelyHex(raw: string): boolean {
  const t = raw.trim();
  return /^#[0-9A-Fa-f]{3}$|^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{8}$/.test(t);
}

function FieldText({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</p>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl border border-[#2a2a2a] bg-[#111] px-3 py-2 text-sm outline-none focus:border-[#F59E0B]/50"
      />
    </div>
  );
}
