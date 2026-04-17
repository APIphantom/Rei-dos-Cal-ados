"use client";

import { MessageCircle } from "lucide-react";

export function WhatsAppFloating() {
  const url = `https://wa.me/5511999999999?text=${encodeURIComponent(
    "Olá, gostaria de saber mais sobre os produtos!"
  )}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] shadow-[0_18px_50px_-20px_rgba(37,211,102,0.65)] transition-transform hover:scale-110 active:scale-100"
      aria-label="Falar no WhatsApp"
    >
      <MessageCircle className="h-6 w-6 text-black" />
    </a>
  );
}

