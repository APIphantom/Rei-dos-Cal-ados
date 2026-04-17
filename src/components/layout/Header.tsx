"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Crown, LogIn, LogOut, Menu, Shield, User, ShoppingBag, X } from "lucide-react";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";
import { useCartStore, useCartTotals } from "@/features/cart/store";
import { useAuth } from "@/components/auth/AuthProvider";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Catálogo", href: "/#catalogo" },
];

const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-full border border-border/60 bg-background/40 px-4 text-[11px] font-bold uppercase tracking-[0.18em] text-foreground backdrop-blur-sm transition-colors hover:border-primary/50 hover:bg-primary/10";

const iconBtn =
  "relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border/60 bg-background/40 text-foreground backdrop-blur-sm transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-primary";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { itemCount } = useCartTotals();
  const openCart = useCartStore((s) => s.open);
  const { user, role, loading, signOut } = useAuth();

  const links = useMemo(() => navLinks, []);
  const isAuthed = !!user;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <Container className="flex h-16 items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            className={cn(iconBtn, "md:hidden")}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link href="/" className="flex min-w-0 items-center gap-2 text-foreground">
            <Crown className="h-5 w-5 shrink-0 text-primary" aria-hidden />
            <span className="truncate font-heading text-sm font-bold tracking-tight sm:text-base">
              Rei Dos <span className="text-primary">Calçados</span>
            </span>
          </Link>
        </div>

        <nav className="font-heading hidden items-center gap-8 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground md:flex">
          {links.map((l) => (
            <Link key={l.label} href={l.href} className="transition-colors hover:text-primary">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {loading ? (
            <div className="hidden h-10 w-[200px] animate-pulse rounded-full border border-border/50 bg-muted/30 md:block" />
          ) : !isAuthed ? (
            <div className="hidden items-center gap-2 md:flex">
              <Link href="/login" className={cn(btnBase, "h-10")}>
                <LogIn className="h-4 w-4 text-primary" aria-hidden />
                Login
              </Link>
              <Link
                href="/register"
                className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-[11px] font-bold uppercase tracking-[0.18em] text-primary-foreground transition-opacity hover:opacity-90"
              >
                Cadastre-se
              </Link>
            </div>
          ) : (
            <>
              <div className="hidden items-center gap-2 md:flex">
                <Link href="/perfil" className={cn(btnBase, "h-10")}>
                  <User className="h-4 w-4 text-primary" aria-hidden />
                  Perfil
                </Link>
                {role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-[11px] font-bold uppercase tracking-[0.18em] text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    <Shield className="h-4 w-4" aria-hidden />
                    Admin
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className={cn(btnBase, "h-10 text-muted-foreground hover:text-primary")}
                >
                  <LogOut className="h-4 w-4" aria-hidden />
                  Sair
                </button>
              </div>
              <Link
                href="/perfil"
                className={cn(iconBtn, "md:hidden")}
                aria-label="Ver perfil"
              >
                <User className="h-5 w-5 text-primary" />
              </Link>
            </>
          )}

          <button type="button" onClick={openCart} className={iconBtn} aria-label="Abrir carrinho">
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
              >
                {itemCount}
              </motion.span>
            )}
          </button>
        </div>
      </Container>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border/40 md:hidden"
          >
            <Container className="py-4">
              <div className="font-heading flex flex-col gap-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {links.map((l) => (
                  <Link
                    key={l.label}
                    href={l.href}
                    onClick={() => setMenuOpen(false)}
                    className="transition-colors hover:text-primary"
                  >
                    {l.label}
                  </Link>
                ))}

                <div className="mt-2 grid gap-2">
                  {loading ? (
                    <div className="h-10 w-full animate-pulse rounded-full border border-border/50 bg-muted/30" />
                  ) : !isAuthed ? (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setMenuOpen(false)}
                        className="inline-flex h-10 items-center justify-center rounded-full border border-border/60 bg-background/40 px-4 text-[11px] font-bold uppercase tracking-[0.18em] text-foreground"
                      >
                        Login
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setMenuOpen(false)}
                        className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-4 text-[11px] font-bold uppercase tracking-[0.18em] text-primary-foreground"
                      >
                        Cadastre-se
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/perfil"
                        onClick={() => setMenuOpen(false)}
                        className="inline-flex h-10 items-center justify-center rounded-full border border-border/60 bg-background/40 px-4 text-[11px] font-bold uppercase tracking-[0.18em] text-foreground"
                      >
                        Perfil
                      </Link>
                      {role === "ADMIN" && (
                        <Link
                          href="/admin"
                          onClick={() => setMenuOpen(false)}
                          className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-4 text-[11px] font-bold uppercase tracking-[0.18em] text-primary-foreground"
                        >
                          Admin
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          void signOut();
                          setMenuOpen(false);
                        }}
                        className="inline-flex h-10 items-center justify-center rounded-full border border-border/60 bg-background/40 px-4 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground hover:text-primary"
                      >
                        Sair
                      </button>
                    </>
                  )}
                </div>
              </div>
            </Container>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
