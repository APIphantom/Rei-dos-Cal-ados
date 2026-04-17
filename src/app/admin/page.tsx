import Link from "next/link";
import { Section } from "@/components/ui/section";
import { getSessionWithProfile } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";

const mockOrders = [
  { id: "ORD-1001", customer: "Mariana S.", total: 349.9, status: "Pago" },
  { id: "ORD-1002", customer: "Rafael L.", total: 289.9, status: "Separando" },
  { id: "ORD-1003", customer: "Camila A.", total: 159.9, status: "Enviado" },
];

export default async function AdminPage() {
  const { user, profile } = await getSessionWithProfile();

  const supabase = await createClient();
  const { count } = await supabase.from("products").select("*", { count: "exact", head: true });

  const displayName = profile?.full_name?.trim() || user?.email || "Admin";

  return (
    <Section>
      <div className="space-y-10">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Admin</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Painel da loja</h1>
            <p className="mt-3 text-sm text-muted-foreground">Visão geral e gestão de produtos.</p>
          </div>
          <Link
            href="/admin/produtos"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground hover:bg-[hsl(var(--primary))]/90"
          >
            Gerenciar produtos
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-3xl border border-border bg-card p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Total de produtos
            </p>
            <p className="mt-3 text-4xl font-bold text-primary">{count ?? 0}</p>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Pedidos (mock)
            </p>
            <p className="mt-3 text-4xl font-bold text-primary">{mockOrders.length}</p>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Operador
            </p>
            <p className="mt-3 text-lg font-bold">{displayName}</p>
            <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Pedidos recentes (mock)
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                <tr>
                  <th className="py-3">Pedido</th>
                  <th className="py-3">Cliente</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockOrders.map((o) => (
                  <tr key={o.id}>
                    <td className="py-4 font-medium">{o.id}</td>
                    <td className="py-4 text-muted-foreground">{o.customer}</td>
                    <td className="py-4">
                      <span className="rounded-full border border-border bg-background/40 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em]">
                        {o.status}
                      </span>
                    </td>
                    <td className="py-4 text-right font-bold text-primary">
                      R$ {o.total.toFixed(2).replace(".", ",")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Section>
  );
}
