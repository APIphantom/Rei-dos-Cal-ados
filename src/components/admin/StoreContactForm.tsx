"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { saveStoreContactSettings } from "@/features/admin/site/actions";
import type { StorePublicSettings } from "@/lib/store-public-settings";

type Props = {
  initial: StorePublicSettings;
};

export function StoreContactForm({ initial }: Props) {
  const [whatsapp, setWhatsapp] = useState(initial.whatsappE164);
  const [email, setEmail] = useState(initial.contactEmail ?? "");
  const [phone, setPhone] = useState(initial.contactPhone ?? "");
  const [city, setCity] = useState(initial.contactCity ?? "");
  const [instagram, setInstagram] = useState(initial.instagramUrl ?? "");
  const [facebook, setFacebook] = useState(initial.facebookUrl ?? "");
  const [pending, startTransition] = useTransition();

  function submit() {
    startTransition(async () => {
      const r = await saveStoreContactSettings({
        store_whatsapp_e164: whatsapp,
        contact_email: email,
        contact_phone: phone,
        contact_city: city,
        instagram_url: instagram,
        facebook_url: facebook,
      });
      if (r.ok) {
        toast.success("Contato atualizado.");
        window.location.reload();
      } else toast.error(r.error);
    });
  }

  return (
    <div className="space-y-6 rounded-2xl border border-[#2a2a2a] bg-[#0f0f0f] p-4 md:p-8">
      <div>
        <h2 className="font-heading text-lg font-bold text-white">Contato e WhatsApp</h2>
        <p className="mt-2 text-sm text-zinc-500">
          Número do WhatsApp (somente dígitos, com DDD e país, ex. 5511999999999). Usado no botão flutuante, checkout e
          links dos produtos.
        </p>
      </div>

      <label className="block space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">WhatsApp (E.164)</span>
        <input
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          className="h-11 w-full rounded-xl border border-[#2a2a2a] bg-[#111] px-4 text-sm text-white outline-none focus:border-[#F59E0B]"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">E-mail</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 w-full rounded-xl border border-[#2a2a2a] bg-[#111] px-4 text-sm text-white outline-none focus:border-[#F59E0B]"
          />
        </label>
        <label className="block space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Telefone (exibição)</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-11 w-full rounded-xl border border-[#2a2a2a] bg-[#111] px-4 text-sm text-white outline-none focus:border-[#F59E0B]"
          />
        </label>
      </div>

      <label className="block space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Cidade / região</span>
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="h-11 w-full rounded-xl border border-[#2a2a2a] bg-[#111] px-4 text-sm text-white outline-none focus:border-[#F59E0B]"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Instagram (URL)</span>
          <input
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
          placeholder="https://instagram.com/..."
          className="h-11 w-full rounded-xl border border-[#2a2a2a] bg-[#111] px-4 text-sm text-white outline-none focus:border-[#F59E0B]"
        />
        </label>
        <label className="block space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Facebook (URL)</span>
          <input
          value={facebook}
          onChange={(e) => setFacebook(e.target.value)}
          placeholder="https://facebook.com/..."
          className="h-11 w-full rounded-xl border border-[#2a2a2a] bg-[#111] px-4 text-sm text-white outline-none focus:border-[#F59E0B]"
        />
        </label>
      </div>

      <button
        type="button"
        disabled={pending}
        onClick={submit}
        className="inline-flex h-12 min-h-[44px] w-full items-center justify-center rounded-full bg-[#F59E0B] px-8 text-xs font-bold uppercase tracking-wider text-black disabled:opacity-50 sm:h-11 sm:w-auto"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar contato"}
      </button>
    </div>
  );
}
