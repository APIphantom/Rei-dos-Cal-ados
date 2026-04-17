"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { formatAuthError } from "@/lib/supabase/auth-errors";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setError(null);
    setInfo(null);
    const name = String(formData.get("name") ?? "");
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const parsed = schema.safeParse({ name, email, password });
    if (!parsed.success) {
      setError("Confira os dados informados.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error: signError } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          data: { full_name: parsed.data.name.trim() },
        },
      });
      if (signError) {
        setError(formatAuthError(signError));
        setLoading(false);
        return;
      }
      if (data.session) {
        router.push("/");
        router.refresh();
        return;
      }
      setInfo(
        "Conta criada. Confirme o email (link enviado) antes de entrar — ou desative a confirmação em Authentication → Providers → Email no Supabase (apenas dev)."
      );
    } catch {
      setError("Não foi possível cadastrar. Verifique o Supabase.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-14">
      <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Criar conta</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Cadastro</h1>
          <p className="mt-3 text-sm text-muted-foreground">Leva menos de 1 minuto para começar.</p>
        </div>

        <form action={onSubmit} className="mt-7 space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Nome
            </label>
            <input
              name="name"
              required
              className="h-12 w-full rounded-xl border border-border bg-background/40 px-4 text-sm outline-none focus:border-primary"
              placeholder="Seu nome"
            />
          </div>
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
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {info && <p className="text-sm text-primary">{info}</p>}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary px-8 text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground disabled:opacity-50"
          >
            {loading ? "Cadastrando..." : "Criar conta"}
          </button>

          <p className="text-center text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link href="/login" className="text-primary underline underline-offset-4">
              Entrar
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
