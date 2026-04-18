"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useStorePublicSettings } from "@/contexts/store-public-context";
import { Section } from "@/components/ui/section";
import { createOrderRecord } from "@/features/orders/actions";
import { formatBRL } from "@/lib/money";
import { buildWaMeUrl } from "@/lib/whatsapp";
import { useCartStore, useCartTotals } from "@/features/cart/store";

const schema = z.object({
  name: z.string().min(2, "Informe seu nome"),
  phone: z.string().min(8, "Informe um telefone válido"),
  address: z.string().min(10, "Informe seu endereço completo"),
});

type FormValues = z.infer<typeof schema>;

function buildOrderMessage(params: {
  values: FormValues;
  lines: ReturnType<typeof useCartStore.getState>["lines"];
  total: number;
}) {
  const { values, lines, total } = params;
  const items = lines
    .map(
      (l) =>
        `- ${l.product.name} | tam ${l.size} | cor ${l.color} | qtd ${l.quantity} | ${formatBRL(
          l.product.price * l.quantity
        )}`
    )
    .join("\n");

  return [
    `Olá! Quero finalizar minha compra.`,
    ``,
    `Nome: ${values.name}`,
    `Telefone: ${values.phone}`,
    `Endereço: ${values.address}`,
    ``,
    `Itens:`,
    items,
    ``,
    `Total: ${formatBRL(total)}`,
  ].join("\n");
}

export default function CheckoutPage() {
  const { whatsappE164 } = useStorePublicSettings();
  const lines = useCartStore((s) => s.lines);
  const clear = useCartStore((s) => s.clear);
  const { total } = useCartTotals();
  const [submitted, setSubmitted] = useState(false);
  const [orderPersisted, setOrderPersisted] = useState<boolean | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", phone: "", address: "" },
    mode: "onTouched",
  });

  const orderUrl = useMemo(() => {
    if (lines.length === 0) return "";
    const values = form.getValues();
    const message = buildOrderMessage({ values, lines, total });
    return buildWaMeUrl(whatsappE164, message);
  }, [lines, total, form, whatsappE164]);

  async function onSubmit(values: FormValues) {
    if (lines.length === 0) return;
    const linesPayload = lines.map((l) => ({
      name: l.product.name,
      brand: l.product.brand,
      size: l.size,
      color: l.color,
      quantity: l.quantity,
      unitPrice: l.product.price,
      lineTotal: l.product.price * l.quantity,
    }));

    const r = await createOrderRecord({
      customer_name: values.name,
      customer_phone: values.phone,
      customer_address: values.address,
      total,
      lines: linesPayload,
    });

    setOrderPersisted(r.ok === true);

    const message = buildOrderMessage({ values, lines, total });
    const url = buildWaMeUrl(whatsappE164, message);
    window.open(url, "_blank", "noopener,noreferrer");
    clear();
    setSubmitted(true);
  }

  return (
    <Section>
      <div className="grid gap-10 lg:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Checkout</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Finalize em 1 minuto</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              O pedido é registrado quando possível e também enviado ao WhatsApp da loja.
            </p>
          </div>

          {submitted ? (
            <div className="rounded-3xl border border-border bg-card p-8">
              <p className="text-sm font-medium">Pedido enviado para o WhatsApp.</p>
              {orderPersisted === false && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Configure{" "}
                  <code className="rounded bg-muted px-1 py-0.5 text-foreground">SUPABASE_SERVICE_ROLE_KEY</code> no
                  servidor para gravar pedidos automaticamente na base.
                </p>
              )}
              <p className="mt-2 text-sm text-muted-foreground">Se a janela não abriu, use o link abaixo.</p>
              <a
                href={orderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground"
              >
                Abrir WhatsApp
              </a>
              <Link
                href="/"
                className="mt-3 inline-flex h-12 items-center justify-center rounded-xl border border-border bg-background/40 px-8 text-xs font-bold uppercase tracking-[0.2em] hover:border-primary/60"
              >
                Voltar para Home
              </Link>
            </div>
          ) : (
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-5 rounded-3xl border border-border bg-card p-6"
            >
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Nome</label>
                <input
                  className="h-12 w-full rounded-xl border border-border bg-background/40 px-4 text-sm outline-none focus:border-primary"
                  {...form.register("name")}
                />
                {form.formState.errors.name?.message && (
                  <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  Telefone
                </label>
                <input
                  className="h-12 w-full rounded-xl border border-border bg-background/40 px-4 text-sm outline-none focus:border-primary"
                  {...form.register("phone")}
                />
                {form.formState.errors.phone?.message && (
                  <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  Endereço
                </label>
                <textarea
                  rows={4}
                  className="w-full rounded-xl border border-border bg-background/40 px-4 py-3 text-sm outline-none focus:border-primary"
                  {...form.register("address")}
                />
                {form.formState.errors.address?.message && (
                  <p className="text-xs text-destructive">{form.formState.errors.address.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={lines.length === 0}
                className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary px-8 text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground disabled:opacity-50"
              >
                Enviar pedido no WhatsApp
              </button>

              <p className="text-xs text-muted-foreground">
                Ao enviar, você confirma os itens e inicia o atendimento para pagamento e entrega.
              </p>
            </form>
          )}
        </div>

        <aside className="h-fit rounded-3xl border border-border bg-card p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Resumo do pedido</p>
          <div className="mt-4 space-y-3">
            {lines.length === 0 ? (
              <p className="text-sm text-muted-foreground">Seu carrinho está vazio.</p>
            ) : (
              lines.map((l) => (
                <div key={`${l.product.id}-${l.size}-${l.color}`} className="flex justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{l.product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {l.product.brand} · {l.size} · {l.color} · qtd {l.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-primary">{formatBRL(l.product.price * l.quantity)}</p>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-xl font-bold text-primary">{formatBRL(total)}</span>
          </div>

          <Link
            href="/carrinho"
            className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-xl border border-border bg-background/40 px-8 text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:border-primary/60"
          >
            Editar carrinho
          </Link>
        </aside>
      </div>
    </Section>
  );
}
