"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LayoutGrid, Shield } from "lucide-react";

type Props = {
  isAdmin: boolean;
};

export function ProfileActions({ isAdmin }: Props) {
  return (
    <div className="border-t border-white/10 bg-black/15 px-6 py-6 sm:px-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="sm:order-1">
          <Link
            href="/#catalogo"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-transparent px-6 text-[11px] font-bold uppercase tracking-[0.2em] text-foreground transition-all duration-300 hover:border-primary/50 hover:bg-primary/10 hover:shadow-[0_0_24px_-6px_rgba(245,158,11,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:w-auto"
          >
            <LayoutGrid className="h-4 w-4 text-primary" aria-hidden />
            Ir ao catálogo
          </Link>
        </motion.div>
        {isAdmin && (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="sm:order-2">
            <Link
              href="/admin"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 px-8 text-[11px] font-bold uppercase tracking-[0.2em] text-black shadow-lg shadow-amber-500/20 transition-all duration-300 hover:from-amber-300 hover:via-amber-400 hover:to-orange-400 hover:shadow-xl hover:shadow-amber-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:w-auto"
            >
              <Shield className="h-4 w-4" aria-hidden />
              Abrir admin
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
