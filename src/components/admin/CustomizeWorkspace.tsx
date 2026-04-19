"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ImageIcon, LayoutTemplate, RotateCcw, Save, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { HomeHeroClient, type HeroMedia } from "@/components/home/HomeHeroClient";
import { PromoBannerClient } from "@/components/home/PromoBannerClient";
import { ThemeColorField } from "@/components/admin/ThemeColorField";
import {
  HERO_JPEG_COMPRESS_MAX_BYTES,
  HERO_UI_DEFAULTS,
  MAX_PERSIST_HERO_IMAGE_CHARS,
  flushHeroUiPersistence,
  useHeroUiStore,
  type HeroTextAlign,
} from "@/features/storefront/hero-ui-store";
import {
  BANNER_JPEG_COMPRESS_MAX_BYTES,
  BANNER_UI_DEFAULTS,
  MAX_PERSIST_BANNER_IMAGE_CHARS,
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

function usePreviewScale() {
  const [scale, setScale] = useState(DESKTOP_PREVIEW_SCALE);

  useEffect(() => {
    function compute() {
      const w = window.innerWidth;
      const horizontalPadding = w < 640 ? 24 : w < 1024 ? 48 : 64;
      const maxOuter = Math.max(240, w - horizontalPadding);
      const fit = maxOuter / DESKTOP_PREVIEW_WIDTH_PX;
      const next = Math.min(DESKTOP_PREVIEW_SCALE, Math.max(0.22, fit * 0.98));
      setScale(next);
    }

    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  return scale;
}

type TabKey = "hero" | "banner";
type BannerCropTarget = "desktop" | "mobile";

const PREVIEW_IMAGE_SIZES = `(max-width: ${DESKTOP_PREVIEW_WIDTH_PX}px) 100vw, ${DESKTOP_PREVIEW_WIDTH_PX}px`;

function CustomizeSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[#1a1a1d] bg-[#0c0c0f] p-4 shadow-sm shadow-black/20 sm:p-5">
      <header className="mb-4 border-b border-[#2a2a2a]/80 pb-3">
        <h3 className="text-sm font-bold tracking-tight text-white">{title}</h3>
        {subtitle ? <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-500">{subtitle}</p> : null}
      </header>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

export function CustomizeWorkspace({ heroMedia }: { heroMedia: HeroMedia }) {
  const previewScale = usePreviewScale();
  const [tab, setTab] = useState<TabKey>("hero");
  const [bannerCropOpen, setBannerCropOpen] = useState(false);
  const [bannerCropSrc, setBannerCropSrc] = useState<string | null>(null);
  const [bannerCropTarget, setBannerCropTarget] = useState<BannerCropTarget>("desktop");
  const heroPatch = useHeroUiStore((s) => s.patch);
  const heroReset = useHeroUiStore((s) => s.reset);
  const setHeroImage = useHeroUiStore((s) => s.setImageOverride);
  const setHeroImageMobile = useHeroUiStore((s) => s.setImageOverrideMobile);
  const hero = useHeroUiStore();

  const bannerPatch = useBannerUiStore((s) => s.patch);
  const bannerReset = useBannerUiStore((s) => s.reset);
  const setBannerImage = useBannerUiStore((s) => s.setBannerImage);
  const setBannerImageMobile = useBannerUiStore((s) => s.setBannerImageMobile);
  const banner = useBannerUiStore();

  const bannerInput = useRef<HTMLInputElement>(null);
  const bannerInputMobile = useRef<HTMLInputElement>(null);
  const heroInput = useRef<HTMLInputElement>(null);
  const heroInputMobile = useRef<HTMLInputElement>(null);

  return (
    <div className="mx-auto max-w-6xl space-y-6 sm:space-y-8">
      <div className="rounded-2xl border border-[#2a2a2a] bg-gradient-to-br from-[#101012] to-[#0a0a0c] p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#F59E0B]">Vitrine · loja online</p>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
              Aparência da página inicial
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">
              Edite o bloco principal (hero) e a faixa promocional (banner). As alterações são aplicadas na pré-visualização
              à direita; <strong className="font-semibold text-zinc-300">Salvar</strong> grava no dispositivo. A mídia base
              do hero (imagem ou vídeo principal) pode ser definida em{" "}
              <Link href="/admin/settings" className="font-medium text-[#F59E0B] underline-offset-2 hover:underline">
                Configurações
              </Link>
              .
            </p>
          </div>
          <div className="flex w-full shrink-0 flex-col gap-2 sm:flex-row sm:items-center lg:w-auto lg:flex-col lg:items-stretch">
            <button
              type="button"
              onClick={() => {
                flushHeroUiPersistence();
                flushBannerUiPersistence();
                toast.success("Configuração guardada neste dispositivo.");
              }}
              className="inline-flex h-11 min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#F59E0B] px-5 text-sm font-bold text-black transition-opacity hover:opacity-90 sm:min-w-[160px] lg:w-full"
            >
              <Save className="h-4 w-4" />
              Guardar alterações
            </button>
            <Link
              href="/admin"
              className="inline-flex h-10 items-center justify-center text-center text-sm font-medium text-zinc-500 transition-colors hover:text-[#F59E0B]"
            >
              ← Voltar ao painel
            </Link>
          </div>
        </div>
      </div>

      <div
        className="grid grid-cols-1 gap-2 rounded-2xl border border-[#2a2a2a] bg-[#080808] p-1.5 sm:grid-cols-2"
        role="tablist"
        aria-label="Área a editar"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "hero"}
          onClick={() => setTab("hero")}
          className={`flex min-h-[52px] items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors sm:min-h-[56px] ${
            tab === "hero"
              ? "bg-[#F59E0B] text-black shadow-lg shadow-[#F59E0B]/15"
              : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100"
          }`}
        >
          <span
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${
              tab === "hero" ? "bg-black/10" : "bg-[#111]"
            }`}
          >
            <LayoutTemplate className="h-5 w-5" aria-hidden />
          </span>
          <span>
            <span className="block text-sm font-bold">Hero</span>
            <span className={`mt-0.5 block text-xs ${tab === "hero" ? "text-black/75" : "text-zinc-500"}`}>
              Topo · imagem e textos principais
            </span>
          </span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "banner"}
          onClick={() => setTab("banner")}
          className={`flex min-h-[52px] items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors sm:min-h-[56px] ${
            tab === "banner"
              ? "bg-[#F59E0B] text-black shadow-lg shadow-[#F59E0B]/15"
              : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100"
          }`}
        >
          <span
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${
              tab === "banner" ? "bg-black/10" : "bg-[#111]"
            }`}
          >
            <Sparkles className="h-5 w-5" aria-hidden />
          </span>
          <span>
            <span className="block text-sm font-bold">Banner promocional</span>
            <span className={`mt-0.5 block text-xs ${tab === "banner" ? "text-black/75" : "text-zinc-500"}`}>
              Faixa abaixo do hero · ofertas e CTAs
            </span>
          </span>
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,400px)_minmax(0,1fr)] xl:gap-8">
        <motion.aside
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-5"
        >
          {tab === "hero" ? (
            <>
              <div className="flex items-center justify-between gap-3 rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] px-4 py-3">
                <div className="flex min-w-0 items-center gap-2">
                  <ImageIcon className="h-4 w-4 shrink-0 text-[#F59E0B]" aria-hidden />
                  <span className="truncate text-sm font-semibold text-white">Controlo do hero</span>
                </div>
                <button
                  type="button"
                  onClick={() => heroReset()}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#2a2a2a] bg-[#111] px-2.5 py-1.5 text-[11px] font-semibold text-zinc-300 transition-colors hover:border-[#F59E0B]/45"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Repor
                </button>
              </div>

              <CustomizeSection
                title="Imagens locais (opcional)"
                subtitle="Substituem temporariamente a mídia das Configurações neste equipamento. Útil para testar composições antes de publicar."
              >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Imagem · desktop</p>
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
                        const { dataUrl, width, height } = await fileToCompressedJpegDataUrl(f, {
                          maxBytes: HERO_JPEG_COMPRESS_MAX_BYTES,
                          maxSide: 1920,
                        });
                        if (dataUrl.length > MAX_PERSIST_HERO_IMAGE_CHARS) {
                          toast.error(
                            "Imagem grande demais após compressão. Tente um ficheiro menor."
                          );
                          return;
                        }
                        setHeroImage(dataUrl, true, { width, height });
                        toast.success("Imagem desktop do hero aplicada.");
                      } catch {
                        toast.error("Não foi possível processar a imagem. Tente um ficheiro menor ou outro formato.");
                      }
                    })();
                  }}
                />
                <p className="mt-2 text-[11px] leading-relaxed text-zinc-600">
                  Na loja, o hero usa uma <strong className="font-semibold text-zinc-500">altura panorâmica fixa</strong> (a
                    imagem é enquadrada sem distorcer). A mídia “oficial” do site continua a ser definida em{" "}
                  <strong className="font-semibold text-zinc-500">Configurações</strong>.
                </p>
                <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-zinc-400">
                  <input
                    type="checkbox"
                    checked={hero.useImageOverride}
                    onChange={(e) => setHeroImage(hero.imageOverride, e.target.checked)}
                    className="rounded border-[#2a2a2a] bg-[#111]"
                  />
                  Usar imagem enviada em vez da imagem das configurações
                </label>
                <button
                  type="button"
                  className="mt-2 text-xs font-semibold text-red-400/90 hover:text-red-300"
                  onClick={() => {
                    setHeroImage(null, false);
                    if (heroInput.current) heroInput.current.value = "";
                    if (heroInputMobile.current) heroInputMobile.current.value = "";
                  }}
                >
                  Limpar imagens locais
                </button>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Imagem · telemóvel</p>
                <p className="mt-1 text-[11px] leading-relaxed text-zinc-600">
                  Opcional. Usada em ecrãs estreitos (&lt; breakpoint <code className="rounded bg-[#111] px-1">md</code>).
                  Se não enviar, repete-se a imagem de desktop.
                </p>
                <input
                  ref={heroInputMobile}
                  type="file"
                  accept="image/*"
                  className="mt-2 w-full cursor-pointer text-sm text-zinc-400 file:mr-3 file:rounded-lg file:border-0 file:bg-[#111] file:px-3 file:py-2 file:text-xs file:font-bold file:text-[#F59E0B]"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    e.target.value = "";
                    if (!f) return;
                    void (async () => {
                      try {
                        const { dataUrl, width, height } = await fileToCompressedJpegDataUrl(f, {
                          maxBytes: HERO_JPEG_COMPRESS_MAX_BYTES,
                          maxSide: 1920,
                        });
                        if (dataUrl.length > MAX_PERSIST_HERO_IMAGE_CHARS) {
                          toast.error(
                            "Imagem grande demais após compressão. Tente um ficheiro menor."
                          );
                          return;
                        }
                        setHeroImageMobile(dataUrl, { width, height });
                        toast.success("Imagem do hero (mobile) aplicada.");
                      } catch {
                        toast.error("Não foi possível processar a imagem. Tente um ficheiro menor ou outro formato.");
                      }
                    })();
                  }}
                />
                <button
                  type="button"
                  className="mt-2 text-xs font-semibold text-red-400/90 hover:text-red-300"
                  onClick={() => {
                    setHeroImageMobile(null);
                    if (heroInputMobile.current) heroInputMobile.current.value = "";
                  }}
                >
                  Remover só imagem mobile
                </button>
              </div>

              <HeroImageHint />

              {heroMedia.type === "video" && !hero.useImageOverride ? (
                <FocalPresetRow
                  label="Enquadramento do vídeo"
                  description="Escolha o ponto de foco quando o vídeo é cortado para caber na faixa do hero."
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
              </CustomizeSection>

              <CustomizeSection
                title="Sobreposição e contraste"
                subtitle="Camada escura ou gradiente por cima da imagem/vídeo para o texto saltar à vista."
              >
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
              </CustomizeSection>

              <CustomizeSection
                title="Textos e alinhamento"
                subtitle="Estes textos aparecem sobre o hero. Arraste o bloco na pré-visualização para posicionar."
              >
              <FieldText label="Etiqueta pequena" value={hero.eyebrow} onChange={(eyebrow) => heroPatch({ eyebrow })} />
              <FieldText label="Título principal" value={hero.headline} onChange={(headline) => heroPatch({ headline })} />
              <FieldText label="Subtítulo" value={hero.subline} onChange={(subline) => heroPatch({ subline })} />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Alinhamento do bloco</p>
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
                      {a === "left" ? "Esquerda" : a === "center" ? "Centro" : "Direita"}
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
              </CustomizeSection>

              <CustomizeSection
                title="Cores do texto e botões"
                subtitle="Combine com o tema da loja; «Restaurar» volta ao padrão do tema."
              >
              <ThemeColorField
                label="Etiqueta pequena"
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
              </CustomizeSection>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3 rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] px-4 py-3">
                <div className="flex min-w-0 items-center gap-2">
                  <Sparkles className="h-4 w-4 shrink-0 text-[#F59E0B]" aria-hidden />
                  <span className="truncate text-sm font-semibold text-white">Faixa promocional</span>
                </div>
                <button
                  type="button"
                  onClick={() => bannerReset()}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#2a2a2a] bg-[#111] px-2.5 py-1.5 text-[11px] font-semibold text-zinc-300 transition-colors hover:border-[#F59E0B]/45"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Repor
                </button>
              </div>

              <CustomizeSection
                title="Visibilidade e imagens"
                subtitle="O recorte usa proporção larga (~11∶4). Envie arte em paisagem; pode haver imagem extra para telemóvel."
              >
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-[#2a2a2a] bg-[#0a0a0a] px-3 py-3 text-sm text-zinc-200">
                <input
                  type="checkbox"
                  checked={banner.enabled}
                  onChange={(e) => bannerPatch({ enabled: e.target.checked })}
                  className="h-4 w-4 rounded border-[#2a2a2a] bg-[#111]"
                />
                <span>
                  <span className="block font-semibold">Mostrar banner na página inicial</span>
                  <span className="mt-0.5 block text-xs text-zinc-500">Desative para ocultar a faixa (textos e imagens ficam guardados).</span>
                </span>
              </label>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Imagem · desktop</p>
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
                    setBannerCropTarget("desktop");
                    setBannerCropSrc(url);
                    setBannerCropOpen(true);
                  }}
                />
                <p className="mt-2 text-[11px] leading-relaxed text-zinc-600">
                  Depois do recorte (proporção do banner), a imagem é otimizada em JPEG.
                </p>
                <button
                  type="button"
                  className="mt-2 text-xs font-semibold text-red-400/90 hover:text-red-300"
                  onClick={() => {
                    setBannerImage(null);
                    if (bannerInput.current) bannerInput.current.value = "";
                  }}
                >
                  Remover imagem desktop
                </button>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Imagem (mobile)</p>
                <p className="mt-1 text-[11px] leading-relaxed text-zinc-600">
                  Opcional. Mesma proporção de recorte que a desktop; exibida em telas estreitas. Se não enviar, usa a imagem
                  desktop.
                </p>
                <input
                  ref={bannerInputMobile}
                  type="file"
                  accept="image/*"
                  className="mt-2 w-full cursor-pointer text-sm text-zinc-400 file:mr-3 file:rounded-lg file:border-0 file:bg-[#111] file:px-3 file:py-2 file:text-xs file:font-bold file:text-[#F59E0B]"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    e.target.value = "";
                    if (!f) return;
                    const url = URL.createObjectURL(f);
                    setBannerCropTarget("mobile");
                    setBannerCropSrc(url);
                    setBannerCropOpen(true);
                  }}
                />
                <button
                  type="button"
                  className="mt-2 text-xs font-semibold text-red-400/90 hover:text-red-300"
                  onClick={() => {
                    setBannerImageMobile(null);
                    if (bannerInputMobile.current) bannerInputMobile.current.value = "";
                  }}
                >
                  Remover imagem mobile
                </button>
              </div>

              <BannerIdealSizeInfo />

              <FocalPresetRow
                label="Enquadramento da imagem"
                description="Define o ponto focal quando a imagem é cortada na faixa do banner."
                presets={[
                  { label: "Superior", value: "50% 35%" },
                  { label: "Meio-alto", value: "50% 45%" },
                  { label: "Centro", value: "50% 50%" },
                  { label: "Inferior", value: "50% 62%" },
                ]}
                value={banner.imageObjectPosition}
                onSelect={(imageObjectPosition) => bannerPatch({ imageObjectPosition })}
              />
              </CustomizeSection>

              <CustomizeSection title="Sobreposição" subtitle="Escurecimento ou gradiente por cima da arte do banner.">
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
              </CustomizeSection>

              <CustomizeSection
                title="Textos e alinhamento"
                subtitle="Mensagens da faixa. Arraste o bloco na pré-visualização para posicionar."
              >
              <FieldText label="Etiqueta pequena" value={banner.eyebrow} onChange={(eyebrow) => bannerPatch({ eyebrow })} />
              <FieldText label="Título" value={banner.headline} onChange={(headline) => bannerPatch({ headline })} />
              <FieldText label="Subtítulo" value={banner.subline} onChange={(subline) => bannerPatch({ subline })} />

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Alinhamento do bloco</p>
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
                      {a === "left" ? "Esquerda" : a === "center" ? "Centro" : "Direita"}
                    </button>
                  ))}
                </div>
              </div>
              </CustomizeSection>

              <CustomizeSection title="Cores do texto e botão" subtitle="Harmonize com o resto da loja.">
              <ThemeColorField
                label="Etiqueta pequena"
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
              </CustomizeSection>
            </>
          )}
        </motion.aside>

        <div className="min-w-0 overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[#080808] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)] xl:sticky xl:top-6 xl:self-start">
          <div className="border-b border-[#2a2a2a] bg-[#0c0c0e] px-3 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500 sm:px-4 sm:text-xs sm:tracking-[0.2em]">
            <span className="flex items-center gap-2">
              <span className="hidden h-2 w-2 shrink-0 rounded-full bg-[#F59E0B] sm:inline" aria-hidden />
              <span className="block sm:inline">Pré-visualização · arraste o bloco de texto ({tab === "hero" ? "hero" : "banner"})</span>
            </span>
            <span className="mt-1 block font-normal normal-case tracking-normal text-zinc-600 sm:mt-0 sm:ml-2 sm:inline">
              {DESKTOP_PREVIEW_WIDTH_PX}px · {Math.round(previewScale * 100)}%
            </span>
          </div>
          <div className="max-h-[min(70vh,920px)] overflow-x-auto overflow-y-auto overscroll-contain sm:max-h-[min(90vh,920px)]">
            <div className="flex min-w-0 justify-center bg-[#050505] px-1 py-3 sm:px-2 sm:py-4">
              <ScaledDesktopPreview scale={previewScale}>
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

      <p className="hidden text-center text-xs text-zinc-600 lg:block">
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
            const { dataUrl } = await fileToCompressedJpegDataUrl(file, {
              maxBytes: BANNER_JPEG_COMPRESS_MAX_BYTES,
              maxSide: 1920,
            });
            if (dataUrl.length > MAX_PERSIST_BANNER_IMAGE_CHARS) {
              toast.error(
                "Imagem ainda grande demais após compressão. Tente uma foto menor ou mais simples."
              );
              return;
            }
            if (bannerCropTarget === "desktop") {
              setBannerImage(dataUrl);
              bannerPatch({ enabled: true });
              toast.success("Imagem do banner (desktop) aplicada.");
            } else {
              setBannerImageMobile(dataUrl);
              toast.success("Imagem do banner (mobile) aplicada.");
            }
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
    <div className="rounded-lg border border-[#F59E0B]/20 bg-[#F59E0B]/[0.06] p-3 text-[11px] leading-relaxed text-zinc-400">
      <p className="font-semibold text-zinc-200">Como funciona na loja</p>
      <p className="mt-2">
        O hero na página pública usa uma <strong className="text-zinc-300">faixa panorâmica de altura fixa</strong>; a imagem
        encaixa com recorte suave (sem distorcer). Envios aqui são comprimidos (lado máx. 1920px).
      </p>
    </div>
  );
}

function BannerIdealSizeInfo() {
  return (
    <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.07] p-4 text-xs leading-relaxed text-zinc-400">
      <p className="font-semibold text-amber-200/95">Tamanho ideal do arquivo (banner)</p>
      <ul className="mt-2 list-inside list-disc space-y-1.5">
        <li>
          <strong className="text-zinc-300">Desktop e mobile:</strong> o mesmo recorte (~11∶4) vale para as duas imagens; a
          mobile é opcional e só aparece em telas estreitas.
        </li>
        <li>
          <strong className="text-zinc-300">Recorte:</strong> o modal fixa a proporção da faixa do banner (~11∶4). Use fotos
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
      <p className="mt-2 hidden font-mono text-[10px] text-zinc-600 sm:block">Atual: {value}</p>
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
