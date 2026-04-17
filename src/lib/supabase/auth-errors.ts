import type { AuthError } from "@supabase/supabase-js";

/** Mensagens amigáveis para erros comuns do Auth (login/cadastro). */
export function formatAuthError(error: AuthError | Error): string {
  const raw = error.message ?? "";
  const m = raw.toLowerCase();

  if (m.includes("invalid login credentials") || m.includes("invalid_grant")) {
    return "Email ou senha incorretos.";
  }
  if (m.includes("email not confirmed") || m.includes("signup_disabled")) {
    return "Confirme seu email antes de entrar. Verifique a caixa de entrada ou, em desenvolvimento, desative a confirmação em Authentication → Providers → Email no Supabase.";
  }
  if (m.includes("user already registered") || m.includes("already been registered")) {
    return "Este email já está cadastrado. Tente fazer login.";
  }
  if (m.includes("password") && m.includes("least")) {
    return "A senha não atende aos requisitos mínimos.";
  }
  if (m.includes("network") || m.includes("fetch")) {
    return "Falha de rede. Verifique sua conexão e a URL do Supabase.";
  }

  return raw || "Não foi possível concluir. Tente novamente.";
}
