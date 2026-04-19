"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LogIn, LogOut, Menu, Shield, User, ShoppingBag, X } from "lucide-react";
import { BrandLogo } from "@/components/profile/brand-logo";
import { Container } from "@/components/ui/container";
import { HeaderSearch } from "@/components/layout/HeaderSearch";
import { cn } from "@/lib/utils";
import { useCartStore, useCartTotals } from "@/features/cart/store";
import { useAuth } from "@/components/auth/AuthProvider";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Catálogo", href: "/#catalogo" },
];

const btnGhost =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-border/50 bg-transparent px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-foreground transition-colors hover:border-primary/40 hover:bg-primary/10";

const iconCircle =
  "relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/50 text-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { itemCount } = useCartTotals();
  const openCart = useCartStore((s) => s.open);
  const { user, role, loading, signOut } = useAuth();

  const links = useMemo(() => navLinks, []);
  const isAuthed = !!user;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-md">
      <Container className="grid h-14 min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 md:gap-4">
        <div className="flex min-w-0 items-center gap-2 md:gap-3">
          <button
            type="button"
            className={cn(iconCircle, "md:hidden")}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>

          <BrandLogo priority className="min-w-0" />
        </div>

        <nav className="font-heading hidden items-center justify-center gap-8 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground md:flex">
          {links.map((l) => (
            <Link key={l.label} href={l.href} className="transition-colors hover:text-primary">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex min-w-0 items-center justify-end gap-2 md:gap-3">
          <Suspense fallback={<div className="hidden h-9 min-w-0 w-[min(200px,calc(100vw-22rem))] md:block" />}>
            <HeaderSearch />
          </Suspense>

          <div className="flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-2">
            {!isAuthed ? (
              <>
                <Link
                  href="/login"
                  className={cn(btnGhost, "hidden sm:inline-flex", loading && "opacity-70")}
                >
                  <LogIn className="h-3.5 w-3.5 text-primary" />
                  Login
                </Link>
                <Link
                  href="/login"
                  className={cn(iconCircle, "sm:hidden", loading && "opacity-70")}
                  aria-label="Login"
                >
                  <LogIn className="h-4 w-4 text-primary" />
                </Link>
                <Link
                  href="/register"
                  className={cn(
                    "hidden h-9 items-center justify-center rounded-full bg-primary px-4 text-[10px] font-bold uppercase tracking-[0.18em] text-primary-foreground transition-opacity hover:opacity-90 sm:inline-flex",
                    loading && "opacity-70"
                  )}
                >
                  Cadastre-se
                </Link>
              </>
            ) : (
              <div className="flex min-w-0 items-center gap-1.5 md:gap-2">
                <Link href="/perfil" className={btnGhost} aria-label="Perfil">
                  <User className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span className="max-md:sr-only">Perfil</span>
                </Link>
                {role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-primary px-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-primary-foreground transition-opacity hover:opacity-90 md:px-3"
                  >
                    <Shield className="h-3.5 w-3.5" />
                    <span className="max-md:sr-only">Admin</span>
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className={cn(btnGhost, "shrink-0 text-muted-foreground hover:text-primary")}
                  aria-label="Sair"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="max-md:sr-only">Sair</span>
                </button>
              </div>
            )}

            <button type="button" onClick={openCart} className={iconCircle} aria-label="Abrir carrinho">
              <ShoppingBag className="h-4 w-4" />
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-primary px-0.5 text-[9px] font-bold text-primary-foreground"
                >
                  {itemCount}
                </motion.span>
              )}
            </button>
          </div>
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
              <div className="font-heading flex flex-col gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
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

                <div className="mt-2 grid gap-2 border-t border-border/40 pt-4">
                  {!isAuthed ? (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setMenuOpen(false)}
                        className="inline-flex h-9 items-center justify-center rounded-full border border-border/50 px-4 text-[10px] font-bold uppercase tracking-[0.18em] text-foreground"
                      >
                        Login
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setMenuOpen(false)}
                        className="inline-flex h-9 items-center justify-center rounded-full bg-primary px-4 text-[10px] font-bold uppercase tracking-[0.18em] text-primary-foreground"
                      >
                        Cadastre-se
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/perfil"
                        onClick={() => setMenuOpen(false)}
                        className="inline-flex h-9 items-center justify-center rounded-full border border-border/50 px-4 text-[10px] font-bold uppercase tracking-[0.18em] text-foreground"
                      >
                        Perfil
                      </Link>
                      {role === "ADMIN" && (
                        <Link
                          href="/admin"
                          onClick={() => setMenuOpen(false)}
                          className="inline-flex h-9 items-center justify-center rounded-full bg-primary px-4 text-[10px] font-bold uppercase tracking-[0.18em] text-primary-foreground"
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
                        className="inline-flex h-9 items-center justify-center rounded-full border border-border/50 px-4 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground hover:text-primary"
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
