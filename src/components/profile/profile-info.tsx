import { roleLabel } from "@/lib/user-display";

type RowProps = { label: string; value: string };

function InfoRow({ label, value }: RowProps) {
  return (
    <div className="rounded-xl border border-white/5 bg-black/20 px-4 py-3 transition-colors duration-300 hover:border-white/10 hover:bg-black/25 sm:px-5 sm:py-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
      <p className="mt-1.5 break-words text-sm font-medium text-foreground sm:text-base">{value}</p>
    </div>
  );
}

type Props = {
  displayName: string;
  email: string;
  role: "USER" | "ADMIN";
};

export function ProfileInfo({ displayName, email, role }: Props) {
  return (
    <div className="px-6 py-8 sm:px-10">
      <div className="mb-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        <h2 className="shrink-0 text-[10px] font-bold uppercase tracking-[0.28em] text-muted-foreground">Informações</h2>
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      </div>
      <div className="grid gap-3 sm:grid-cols-1 sm:gap-4 md:grid-cols-3">
        <InfoRow label="Nome" value={displayName} />
        <InfoRow label="Email" value={email} />
        <InfoRow label="Tipo de conta" value={roleLabel(role)} />
      </div>
    </div>
  );
}
