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
  { label: "Tênis", href: "/?cat=Tênis#catalogo" },
  { label: "Sandálias", href: "/?cat=Sandálias#catalogo" },
  { label: "Botas", href: "/?cat=Botas#catalogo" },
];

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
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card/40 md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Link href="/" className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-primary" />
          <span className="font-heading text-sm font-bold tracking-tight sm:text-base">
            Rei Dos <span className="text-primary">Calçados</span>
          </span>
        </Link>

        <nav className="font-heading hidden items-center gap-8 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground md:flex">
          {links.map((l) => (
            <Link key={l.label} href={l.href} className="transition-colors hover:text-primary">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {loading ? (
            <div className="hidden h-10 w-[220px] animate-pulse rounded-lg border border-border bg-card/40 md:block" />
          ) : !isAuthed ? (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                href="/login"
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-card/40 px-4 text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:border-primary/60"
              >
                <LogIn className="h-4 w-4" />
                Login
              </Link>
              <Link
                href="/register"
                className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-[hsl(var(--primary))]/90"
              >
                Cadastre-se
              </Link>
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                href="/perfil"
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-card/40 px-4 text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:border-primary/60"
              >
                <User className="h-4 w-4" />
                Perfil
              </Link>
              {role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground shadow-[0_14px_40px_-18px_hsl(var(--primary)/0.55)] transition-colors hover:bg-[hsl(var(--primary))]/90"
                >
                  <Shield className="h-4 w-4" />
                  Admin
                </Link>
              )}
              <button
                type="button"
                onClick={() => void signOut()}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-card/40 px-4 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={openCart}
            className={cn(
              "relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card/40 transition-colors hover:border-primary/60"
            )}
            aria-label="Abrir carrinho"
          >
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
            className="overflow-hidden border-t border-border md:hidden"
          >
            <Container className="py-4">
              <div className="font-heading flex flex-col gap-4 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
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
                    <div className="h-10 w-full animate-pulse rounded-lg border border-border bg-card/40" />
                  ) : !isAuthed ? (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setMenuOpen(false)}
                        className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-card/40 px-4 text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:border-primary/60"
                      >
                        Login
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setMenuOpen(false)}
                        className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground hover:bg-[hsl(var(--primary))]/90"
                      >
                        Cadastre-se
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/perfil"
                        onClick={() => setMenuOpen(false)}
                        className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-card/40 px-4 text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:border-primary/60"
                      >
                        Perfil
                      </Link>
                      {role === "ADMIN" && (
                        <Link
                          href="/admin"
                          onClick={() => setMenuOpen(false)}
                          className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground hover:bg-[hsl(var(--primary))]/90"
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
                        className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-card/40 px-4 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary"
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
