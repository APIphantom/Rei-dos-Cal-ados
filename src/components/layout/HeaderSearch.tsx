"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useCallback } from "react";

export function HeaderSearch() {
  const router = useRouter();
  const sp = useSearchParams();
  const q = sp.get("q") ?? "";

  const onSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      const nextQ = String(fd.get("q") ?? "").trim();
      const next = new URLSearchParams(sp.toString());
      if (!nextQ) next.delete("q");
      else next.set("q", nextQ);
      const qs = next.toString();
      router.push(qs ? `/?${qs}#catalogo` : "/#catalogo");
    },
    [router, sp]
  );

  return (
    <form onSubmit={onSubmit} className="hidden w-full max-w-[200px] md:block lg:max-w-[260px]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar…"
          autoComplete="off"
          className="h-9 w-full rounded-full border border-border/50 bg-muted/15 py-2 pl-9 pr-3 text-[11px] text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
        />
      </div>
    </form>
  );
}
