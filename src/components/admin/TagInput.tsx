"use client";

import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  className?: string;
};

export function TagInput({ value, onChange, placeholder = "Digite e pressione Enter", className }: Props) {
  const [input, setInput] = useState("");

  function addTag() {
    const t = input.trim();
    if (!t) return;
    if (value.some((x) => x.toLowerCase() === t.toLowerCase())) {
      setInput("");
      return;
    }
    onChange([...value, t]);
    setInput("");
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex min-h-[44px] flex-wrap gap-2 rounded-xl border border-[#2a2a2a] bg-[#111] p-2">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#1a1a1a] px-2.5 py-1 text-xs font-medium text-zinc-200"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((x) => x !== tag))}
              className="rounded p-0.5 text-zinc-500 hover:bg-white/10 hover:text-white"
              aria-label={`Remover ${tag}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={value.length === 0 ? placeholder : ""}
          className="min-w-[140px] flex-1 bg-transparent px-1 text-sm text-white outline-none placeholder:text-zinc-600"
        />
      </div>
      <button
        type="button"
        onClick={addTag}
        className="text-xs font-semibold text-[#F59E0B] hover:underline"
      >
        + Adicionar etiqueta
      </button>
    </div>
  );
}
