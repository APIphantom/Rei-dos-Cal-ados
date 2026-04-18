"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import { deleteTestimonial, saveTestimonial } from "@/features/admin/testimonials/actions";
import type { Testimonial } from "@/types/testimonial";

export function TestimonialsSettingsForm({ initial }: { initial: Testimonial[] }) {
  const [items, setItems] = useState(initial);
  const [author, setAuthor] = useState("");
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();

  function add() {
    startTransition(async () => {
      const r = await saveTestimonial({
        author_name: author,
        body,
        display_order: items.length,
      });
      if (r.ok) {
        toast.success("Depoimento adicionado.");
        setAuthor("");
        setBody("");
        window.location.reload();
      } else toast.error(r.error);
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      const r = await deleteTestimonial(id);
      if (r.ok) {
        toast.success("Removido.");
        setItems((prev) => prev.filter((x) => x.id !== id));
      } else toast.error(r.error);
    });
  }

  return (
    <div className="space-y-6 rounded-2xl border border-[#2a2a2a] bg-[#0f0f0f] p-6 md:p-8">
      <div>
        <h2 className="font-heading text-lg font-bold text-white">Depoimentos (home)</h2>
        <p className="mt-2 text-sm text-zinc-500">Textos exibidos no carrossel da página inicial.</p>
      </div>

      <ul className="divide-y divide-[#2a2a2a]">
        {items.map((t) => (
          <li key={t.id} className="flex flex-wrap items-start justify-between gap-3 py-4 first:pt-0">
            <div>
              <p className="text-sm font-semibold text-white">{t.authorName}</p>
              <p className="mt-1 text-sm text-zinc-400">{t.body}</p>
            </div>
            <button
              type="button"
              onClick={() => remove(t.id)}
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-lg border border-[#2a2a2a] px-3 py-2 text-xs text-zinc-400 hover:border-red-500/50 hover:text-red-400 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Excluir
            </button>
          </li>
        ))}
        {items.length === 0 && <li className="py-4 text-sm text-zinc-500">Nenhum depoimento.</li>}
      </ul>

      <div className="space-y-4 border-t border-[#2a2a2a] pt-6">
        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Novo depoimento</p>
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Nome (ex.: Maria S.)"
          className="h-11 w-full rounded-xl border border-[#2a2a2a] bg-[#111] px-4 text-sm text-white outline-none focus:border-[#F59E0B]"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder="Texto do depoimento"
          className="w-full rounded-xl border border-[#2a2a2a] bg-[#111] px-4 py-3 text-sm text-white outline-none focus:border-[#F59E0B]"
        />
        <button
          type="button"
          disabled={pending || !author.trim() || !body.trim()}
          onClick={add}
          className="inline-flex h-11 items-center justify-center rounded-full border border-[#2a2a2a] px-6 text-xs font-bold uppercase tracking-wider text-zinc-200 hover:border-[#F59E0B]/50 disabled:opacity-50"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Adicionar"}
        </button>
      </div>
    </div>
  );
}
