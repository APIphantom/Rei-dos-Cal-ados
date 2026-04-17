"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { formatAuthError } from "@/lib/supabase/auth-errors";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

function LoginInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const callbackUrl = sp.get("callbackUrl") ?? "/";
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setError(null);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      setError("Confira seu email e senha.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signError } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });
      if (signError) {
        setError(formatAuthError(signError));
        setLoading(false);
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Não foi possível entrar. Verifique o Supabase.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-14">
      <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Acessar</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Login</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Entre para ver seu perfil e acompanhar suas compras.
          </p>
        </div>

        <form
          className="mt-7 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            void onSubmit(fd);
          }}
        >
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              className="h-12 w-full rounded-xl border border-border bg-background/40 px-4 text-sm outline-none focus:border-primary"
              placeholder="voce@exemplo.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Senha
            </label>
            <input
              name="password"
              type="password"
              required
              className="h-12 w-full rounded-xl border border-border bg-background/40 px-4 text-sm outline-none focus:border-primary"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary px-8 text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <p className="text-center text-sm text-muted-foreground">
            Não tem conta?{" "}
            <Link href="/register" className="text-primary underline underline-offset-4">
              Cadastre-se
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-md px-4 py-14">
          <div className="h-[420px] animate-pulse rounded-3xl border border-border bg-card" />
        </div>
      }
    >
      <LoginInner />
    </Suspense>
  );
}
