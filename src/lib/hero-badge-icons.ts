import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  CreditCard,
  Gift,
  MapPin,
  MessageCircle,
  Package,
  Percent,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  Truck,
  Zap,
} from "lucide-react";

const ICON_MAP = {
  truck: Truck,
  zap: Zap,
  package: Package,
  creditCard: CreditCard,
  mapPin: MapPin,
  refresh: RefreshCcw,
  shield: ShieldCheck,
  percent: Percent,
  tag: Tag,
  gift: Gift,
  sparkles: Sparkles,
  star: Star,
  badgeCheck: BadgeCheck,
  message: MessageCircle,
} as const;

export type HeroBadgeManualIcon = keyof typeof ICON_MAP;

export type HeroBadgeIconKey = "auto" | HeroBadgeManualIcon;

export type HeroBadgeEntry = {
  label: string;
  icon: HeroBadgeIconKey;
};

/** Opções para o select no admin (valor → rótulo PT) */
export const HERO_BADGE_ICON_OPTIONS: { value: HeroBadgeIconKey; label: string }[] = [
  { value: "auto", label: "Automático (palavras-chave no texto)" },
  { value: "truck", label: "Camião · frete / envio" },
  { value: "zap", label: "Raio · rapidez" },
  { value: "package", label: "Pacote · entrega" },
  { value: "creditCard", label: "Cartão · parcelas / juros" },
  { value: "mapPin", label: "Pin · Brasil / local" },
  { value: "refresh", label: "Troca / devolução" },
  { value: "shield", label: "Garantia" },
  { value: "percent", label: "Percentagem · promoção" },
  { value: "tag", label: "Etiqueta · % OFF" },
  { value: "gift", label: "Presente / brinde" },
  { value: "sparkles", label: "Novidade / lançamento" },
  { value: "star", label: "Estrela · exclusivo" },
  { value: "badgeCheck", label: "Selo · original" },
  { value: "message", label: "Mensagem · WhatsApp" },
];

const VALID_MANUAL = new Set<string>(Object.keys(ICON_MAP));

function norm(s: string) {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

type Rule = { test: (n: string) => boolean; Icon: LucideIcon };

const rules: Rule[] = [
  { test: (n) => n.includes("whatsapp"), Icon: MessageCircle },
  { test: (n) => n.includes("frete") || n.includes("envio") || n.includes("correio"), Icon: Truck },
  { test: (n) => n.includes("rapida") || n.includes("rapido") || n.includes("agil"), Icon: Zap },
  { test: (n) => n.includes("entrega") || n.includes("retirada"), Icon: Package },
  { test: (n) => n.includes("juros") || n.includes("parcela") || n.includes("cartao") || n.includes("cartão"), Icon: CreditCard },
  { test: (n) => n.includes("brasil") || n.includes("nacional") || n.includes("todo o pais") || n.includes("todo o país"), Icon: MapPin },
  { test: (n) => n.includes("troca") || n.includes("devolucao") || n.includes("devolução"), Icon: RefreshCcw },
  { test: (n) => n.includes("garantia") || n.includes("defeito"), Icon: ShieldCheck },
  { test: (n) => n.includes("desconto") || n.includes("promocao") || n.includes("promoção"), Icon: Percent },
  { test: (n) => n.includes("%") || n.includes("off"), Icon: Tag },
  { test: (n) => n.includes("presente") || n.includes("brinde"), Icon: Gift },
  { test: (n) => n.includes("novo") || n.includes("lancamento") || n.includes("lançamento") || n.includes("drop"), Icon: Sparkles },
  { test: (n) => n.includes("limitado") || n.includes("exclusivo") || n.includes("premium"), Icon: Star },
  { test: (n) => n.includes("original") || n.includes("autentico") || n.includes("autêntico"), Icon: BadgeCheck },
];

export function inferHeroBadgeIcon(label: string): LucideIcon {
  const n = norm(label);
  for (const { test, Icon } of rules) {
    if (test(n)) return Icon;
  }
  return BadgeCheck;
}

export function resolveHeroBadgeIcon(entry: HeroBadgeEntry): LucideIcon {
  if (entry.icon !== "auto" && VALID_MANUAL.has(entry.icon)) {
    return ICON_MAP[entry.icon as HeroBadgeManualIcon];
  }
  return inferHeroBadgeIcon(entry.label);
}

function parseIconKey(raw: unknown): HeroBadgeIconKey {
  if (raw === "auto") return "auto";
  if (typeof raw === "string" && VALID_MANUAL.has(raw)) return raw as HeroBadgeManualIcon;
  return "auto";
}

/** Aceita formato antigo (`string[]`) ou novo (`HeroBadgeEntry[]`). */
export function normalizeHeroBadges(raw: unknown, fallback: HeroBadgeEntry[]): HeroBadgeEntry[] {
  if (!Array.isArray(raw)) return [...fallback];
  const out: HeroBadgeEntry[] = [];
  for (const item of raw) {
    if (typeof item === "string") {
      const label = item.trim();
      if (label) out.push({ label, icon: "auto" });
      continue;
    }
    if (item && typeof item === "object" && "label" in item) {
      const label = String((item as HeroBadgeEntry).label ?? "").trim();
      if (!label) continue;
      out.push({ label, icon: parseIconKey((item as HeroBadgeEntry).icon) });
    }
  }
  return out.length ? out : [];
}
