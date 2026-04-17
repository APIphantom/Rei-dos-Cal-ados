import Link from "next/link";
import { redirect } from "next/navigation";
import { Section } from "@/components/ui/section";
import { getSessionWithProfile } from "@/lib/auth/server";

export default async function ProfilePage() {
  const { user, profile } = await getSessionWithProfile();
  if (!user) redirect("/login");

  const displayName = profile?.full_name?.trim() || user.user_metadata?.full_name || user.email || "Cliente";

  return (
    <Section>
      <div className="mx-auto w-full max-w-2xl rounded-3xl border border-border bg-card p-6 md:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Perfil</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Sua conta</h1>

        <div className="mt-6 space-y-3 text-sm text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">Nome:</span> {displayName}
          </p>
          <p>
            <span className="font-medium text-foreground">Email:</span> {user.email}
          </p>
          <p>
            <span className="font-medium text-foreground">Perfil:</span> {profile?.role ?? "USER"}
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/#catalogo"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-background/40 px-8 text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:border-primary/60"
          >
            Ir ao catálogo
          </Link>
          {profile?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground hover:bg-[hsl(var(--primary))]/90"
            >
              Abrir Admin
            </Link>
          )}
        </div>
      </div>
    </Section>
  );
}
