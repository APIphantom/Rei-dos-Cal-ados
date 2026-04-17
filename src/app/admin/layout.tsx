import Link from "next/link";
import { Container } from "@/components/ui/container";
import { requireAdmin } from "@/lib/auth/require-admin";

const adminNav = [
  { href: "/admin", label: "Painel" },
  { href: "/admin/produtos", label: "Produtos" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-[calc(100vh-4rem)] border-t border-border">
      <div className="border-b border-border bg-card/50">
        <Container className="flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Admin</span>
            <span className="text-muted-foreground">|</span>
            <nav className="flex flex-wrap gap-2">
              {adminNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg border border-transparent px-3 py-2 text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <Link
            href="/"
            className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-primary"
          >
            ← Voltar à loja
          </Link>
        </Container>
      </div>
      {children}
    </div>
  );
}
