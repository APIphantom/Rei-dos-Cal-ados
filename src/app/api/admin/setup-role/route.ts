import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service";

// Promove um utilizador a ADMIN por email (uso restrito; requer segredo de configuração no servidor).
export async function POST(req: Request) {
  const secret = process.env.ADMIN_SETUP_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Setup desativado (defina ADMIN_SETUP_SECRET)." }, { status: 404 });
  }

  const header = req.headers.get("x-admin-setup-secret");
  if (!header || header !== secret) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { email?: string };
  try {
    body = (await req.json()) as { email?: string };
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Informe um email válido." }, { status: 400 });
  }

  const admin = createServiceRoleClient();
  if (!admin) {
    return NextResponse.json({ error: "Configuração do servidor incompleta." }, { status: 500 });
  }

  const { data: list, error: listErr } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (listErr) {
    console.error("[setup-role] listUsers", listErr.message);
    return NextResponse.json({ error: "Não foi possível concluir a operação." }, { status: 500 });
  }

  const user = list.users.find((u) => u.email?.toLowerCase() === email);
  if (!user) {
    return NextResponse.json(
      { error: `Nenhum usuário com email ${email}. Cadastre-se primeiro no site.` },
      { status: 404 }
    );
  }

  const { error: upErr } = await admin.from("profiles").upsert(
    {
      id: user.id,
      full_name: user.user_metadata?.full_name ?? "",
      role: "ADMIN",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (upErr) {
    console.error("[setup-role] upsert profile", upErr.message);
    return NextResponse.json({ error: "Não foi possível concluir a operação." }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    message: "Usuário promovido a ADMIN. Faça logout e login de novo (ou atualize a página) para ver o menu Admin.",
    userId: user.id,
  });
}
