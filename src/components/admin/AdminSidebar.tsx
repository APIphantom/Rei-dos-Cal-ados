"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Palette,
  PanelLeftClose,
  PanelLeft,
  Settings,
  ShoppingBag,
  Store,
  TicketPercent,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
  icon: typeof LayoutDashboard;
  section?: string;
};

const items: NavItem[] = [
  { href: "/admin", label: "Painel", shortLabel: "Painel", icon: LayoutDashboard, section: "Visão geral" },
  { href: "/admin/orders", label: "Pedidos", shortLabel: "Pedidos", icon: ShoppingBag, section: "Operação" },
  { href: "/admin/products", label: "Produtos", shortLabel: "Produtos", icon: Package, section: "Operação" },
  { href: "/admin/promotions", label: "Promoções", shortLabel: "Ofertas", icon: TicketPercent, section: "Vitrine" },
  { href: "/admin/customize", label: "Customização", shortLabel: "Loja", icon: Palette, section: "Vitrine" },
  { href: "/admin/settings", label: "Configurações", shortLabel: "Ajustes", icon: Settings, section: "Loja" },
];

function navActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

type SidebarProps = {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
};

export function AdminSidebar({ collapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className={cn("border-b border-[#1f1f1f]", collapsed ? "px-2 py-4" : "px-5 py-6")}>
        {!collapsed && (
          <>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#F59E0B]">Rei dos Calçados</p>
            <p className="mt-1 font-heading text-lg font-bold tracking-tight">Painel</p>
          </>
        )}
        {collapsed && (
          <div className="flex justify-center" title="Rei dos Calçados · Admin">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#F59E0B]/15 text-[#F59E0B]">
              <LayoutDashboard className="h-4 w-4" aria-hidden />
            </span>
          </div>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 p-2" aria-label="Navegação principal">
        {items.map(({ href, label, icon: Icon, section }, index) => {
          const active = navActive(pathname, href);
          const prevSection = index > 0 ? items[index - 1]?.section : undefined;
          const showSection = !collapsed && section && section !== prevSection;

          return (
            <div key={href}>
              {showSection ? (
                <p className="mb-1.5 mt-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 first:mt-0">
                  {section}
                </p>
              ) : null}
              <Link
                href={href}
                title={collapsed ? label : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl py-2.5 text-sm font-medium transition-colors",
                  collapsed ? "justify-center px-2" : "px-3",
                  active
                    ? "bg-[#F59E0B]/15 text-[#F59E0B] shadow-sm shadow-black/20"
                    : "text-zinc-400 hover:bg-white/[0.06] hover:text-white"
                )}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
                {!collapsed && <span>{label}</span>}
              </Link>
            </div>
          );
        })}
      </nav>

      <div className={cn("border-t border-[#1f1f1f] p-2", collapsed && "flex flex-col items-center gap-1")}>
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className={cn(
              "mb-1 flex w-full items-center gap-2 rounded-xl py-2.5 text-sm text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-zinc-300",
              collapsed ? "justify-center px-2" : "px-3"
            )}
            title={collapsed ? "Expandir menu" : "Recolher menu"}
            aria-expanded={!collapsed}
          >
            {collapsed ? (
              <PanelLeft className="h-4 w-4 shrink-0" aria-hidden />
            ) : (
              <>
                <PanelLeftClose className="h-4 w-4 shrink-0" aria-hidden />
                <span className="text-xs font-medium">Recolher</span>
              </>
            )}
          </button>
        )}
        <Link
          href="/"
          title={collapsed ? "Voltar à loja" : undefined}
          className={cn(
            "flex items-center gap-2 rounded-xl py-2.5 text-sm text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-white",
            collapsed ? "justify-center px-2" : "px-3"
          )}
        >
          <Store className="h-4 w-4 shrink-0" aria-hidden />
          {!collapsed && <span>Voltar à loja</span>}
        </Link>
      </div>
    </div>
  );
}

/** Barra superior compacta em ecrãs pequenos (a navegação principal é a barra inferior). */
export function AdminMobileHeader() {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-[#1f1f1f] bg-[#050505]/95 px-4 py-3 backdrop-blur-md md:hidden">
      <Link href="/admin" className="min-w-0 font-heading text-base font-bold tracking-tight text-white">
        Admin
      </Link>
      <Link
        href="/"
        className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#2a2a2a] bg-[#111] px-3 py-1.5 text-xs font-semibold text-zinc-300 transition-colors hover:border-[#F59E0B]/40 hover:text-white"
      >
        <Store className="h-3.5 w-3.5" aria-hidden />
        Ver loja
      </Link>
    </header>
  );
}

/** Navegação inferior fixa (touch-friendly) em mobile. */
export function AdminBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[#1f1f1f] bg-[#0a0a0a]/95 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1 backdrop-blur-lg md:hidden"
      aria-label="Navegação do painel"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between gap-0.5 px-1">
        {items.map(({ href, shortLabel, icon: Icon }) => {
          const active = navActive(pathname, href);
          return (
            <li key={href} className="min-w-0 flex-1">
              <Link
                href={href}
                className={cn(
                  "flex min-h-[3.25rem] flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-semibold leading-tight transition-colors",
                  active ? "text-[#F59E0B]" : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                <Icon className={cn("h-5 w-5 shrink-0", active ? "text-[#F59E0B]" : "text-zinc-500")} aria-hidden />
                <span className="line-clamp-2 text-center">{shortLabel}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
