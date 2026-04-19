"use client";

import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  role: "USER" | "ADMIN";
  className?: string;
};

export function ProfileRoleBadge({ role, className }: Props) {
  const isAdmin = role === "ADMIN";

  return (
    <motion.span
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em]",
        isAdmin
          ? "border border-emerald-500/35 bg-emerald-500/15 text-emerald-300 shadow-[0_0_20px_-4px_rgba(52,211,153,0.35)]"
          : "border border-white/10 bg-white/5 text-muted-foreground",
        className
      )}
    >
      {isAdmin && (
        <motion.span
          animate={{ opacity: [1, 0.65, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="inline-flex"
          aria-hidden
        >
          <Shield className="h-3.5 w-3.5 text-emerald-400" />
        </motion.span>
      )}
      {isAdmin ? "Admin" : "Cliente"}
    </motion.span>
  );
}
