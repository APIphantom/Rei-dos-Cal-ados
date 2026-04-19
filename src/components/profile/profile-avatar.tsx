"use client";

import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/user-display";

type Props = {
  name: string;
  className?: string;
  size?: "md" | "lg";
};

export function ProfileAvatar({ name, className, size = "lg" }: Props) {
  const initials = getInitials(name);
  const dim = size === "lg" ? "h-20 w-20 text-2xl sm:h-24 sm:w-24 sm:text-3xl" : "h-14 w-14 text-lg";

  return (
    <div
      className={cn(
        "relative shrink-0 rounded-full bg-gradient-to-br from-amber-400/25 via-amber-500/15 to-orange-600/20 p-[3px] shadow-[0_0_32px_-4px_rgba(245,158,11,0.45)] transition-transform duration-300 hover:scale-[1.03] hover:shadow-[0_0_40px_-2px_rgba(245,158,11,0.55)]",
        className
      )}
    >
      <div
        className={cn(
          "flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-zinc-800 to-zinc-950 font-heading font-bold tracking-tight text-primary",
          dim
        )}
      >
        {initials}
      </div>
    </div>
  );
}
