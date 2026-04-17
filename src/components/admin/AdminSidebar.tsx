"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Store } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Painel", icon: LayoutDashboard },
  { href: "/admin/products", label: "Produtos", icon: Package },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[#1f1f1f] px-5 py-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#F59E0B]">Rei dos Calçados</p>
        <p className="mt-1 font-heading text-lg font-bold tracking-tight">Admin</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
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

export function AdminMobileNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-2 overflow-x-auto pb-1 md:hidden" aria-label="Admin">
      {items.map(({ href, label }) => {
        const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider",
              active ? "bg-[#F59E0B] text-black" : "border border-[#2a2a2a] bg-[#111] text-zinc-400"
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
