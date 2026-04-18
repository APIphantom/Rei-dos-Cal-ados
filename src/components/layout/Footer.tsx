import Link from "next/link";
import { Crown, Facebook, Instagram, Lock, ShieldCheck, Truck } from "lucide-react";
import { Container } from "@/components/ui/container";
import type { StorePublicSettings } from "@/lib/store-public-settings";

const nav = [
  { label: "Home", href: "/" },
  { label: "Catálogo", href: "/#catalogo" },
  { label: "Promoções", href: "/#catalogo" },
  { label: "Depoimentos", href: "/#depoimentos" },
];

const categories = [
  { label: "Tênis", href: "/?cat=Tênis" },
  { label: "Sandálias", href: "/?cat=Sandálias" },
  { label: "Botas", href: "/?cat=Botas" },
];

export function Footer({ store }: { store: StorePublicSettings }) {
  const ig = store.instagramUrl?.trim();
  const fb = store.facebookUrl?.trim();
  const email = store.contactEmail?.trim();
  const phone = store.contactPhone?.trim();
  const city = store.contactCity?.trim();

  return (
    <footer className="mt-20 border-t border-border">
      <Container className="py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              <p className="font-heading text-base font-bold">
                Rei Dos <span className="text-primary">Calçados</span>
              </p>
            </div>
            <p className="typo-small leading-relaxed">
              Estilo começa pelos pés. Seleção premium, conforto real e um atendimento que resolve.
            </p>
            <div className="mt-5 flex gap-3">
              <a
                href={ig || "#"}
                className="grid h-10 w-10 place-items-center rounded-full border border-border transition-colors hover:border-primary hover:text-primary"
                aria-label="Instagram"
                {...(ig ? { target: "_blank", rel: "noopener noreferrer" } : { "aria-disabled": true })}
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href={fb || "#"}
                className="grid h-10 w-10 place-items-center rounded-full border border-border transition-colors hover:border-primary hover:text-primary"
                aria-label="Facebook"
                {...(fb ? { target: "_blank", rel: "noopener noreferrer" } : { "aria-disabled": true })}
              >
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <p className="typo-label mb-4 text-foreground">Navegação</p>
            <ul className="font-body flex flex-col gap-2 text-sm text-muted-foreground">
              {nav.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="transition-colors hover:text-primary">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="typo-label mb-4 text-foreground">Categorias</p>
            <ul className="font-body flex flex-col gap-2 text-sm text-muted-foreground">
              {categories.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="transition-colors hover:text-primary">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="typo-label mb-4 text-foreground">Contato</p>
            <div className="font-body space-y-2 text-sm text-muted-foreground">
              {email ? <p>{email}</p> : <p className="text-zinc-600">Email (configure no admin)</p>}
              {phone ? <p>{phone}</p> : null}
              {city ? <p>{city}</p> : null}
              {!email && !phone && !city ? (
                <p className="text-xs text-zinc-600">
                  Defina e-mail e telefone em <span className="text-foreground">Admin → Configurações</span>.
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-6 border-t border-border pt-8 md:grid-cols-2 md:items-center">
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-3 py-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Compra segura
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-3 py-2">
              <Lock className="h-4 w-4 text-primary" />
              Pagamento protegido
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-3 py-2">
              <Truck className="h-4 w-4 text-primary" />
              Frete rápido
            </span>
          </div>

          <p className="text-left text-xs text-muted-foreground md:text-right">
            © {new Date().getFullYear()} Rei Dos Calçados — Todos os direitos reservados.
          </p>
        </div>
      </Container>
    </footer>
  );
}
