"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Palette, Settings, ShoppingBag, Store } from "lucide-react";
import { STORE_LOGO } from "@/lib/brand";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Painel", shortLabel: "Painel", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Pedidos", shortLabel: "Pedidos", icon: ShoppingBag },
  { href: "/admin/customize", label: "Customização", shortLabel: "Loja", icon: Palette },
  { href: "/admin/products", label: "Produtos", shortLabel: "Produtos", icon: Package },
  { href: "/admin/settings", label: "Configurações", shortLabel: "Ajustes", icon: Settings },
];

function navActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[#1f1f1f] px-5 py-6">
        <Image
          src={STORE_LOGO.src}
          alt="Rei dos Calçados"
          width={STORE_LOGO.width}
          height={STORE_LOGO.height}
          className="h-10 w-auto max-w-[200px] object-contain object-left"
        />
        <p className="mt-3 font-heading text-lg font-bold tracking-tight">Admin</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {items.map(({ href, label, icon: Icon }) => {
          const active = navActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-[#F59E0B]/15 text-[#F59E0B]"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-[#1f1f1f] p-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-zinc-500 transition-colors hover:bg-white/5 hover:text-white"
        >
          <Store className="h-4 w-4" />
          Voltar à loja
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
