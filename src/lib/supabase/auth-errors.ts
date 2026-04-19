import type { AuthError } from "@supabase/supabase-js";

export function formatAuthError(error: AuthError | Error): string {
  const raw = error.message ?? "";
  const m = raw.toLowerCase();

  if (m.includes("invalid login credentials") || m.includes("invalid_grant")) {
    return "Email ou senha incorretos.";
  }
  if (m.includes("email not confirmed") || m.includes("signup_disabled")) {
    return "Confirme o seu email antes de entrar. Verifique a caixa de entrada ou a pasta de spam.";
  }
  if (m.includes("user already registered") || m.includes("already been registered")) {
    return "Este email já está cadastrado. Tente fazer login.";
  }
  if (m.includes("password") && m.includes("least")) {
    return "A senha não atende aos requisitos mínimos.";
  }
  if (m.includes("network") || m.includes("fetch")) {
    return "Falha de rede. Verifique a sua ligação à internet e tente novamente.";
  }

  return raw || "Não foi possível concluir. Tente novamente.";
}
