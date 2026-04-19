import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  priority?: boolean;
  compact?: boolean;
};

export function BrandLogo({ className, priority = false, compact = false }: Props) {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex shrink-0 items-center outline-none transition-all duration-300",
        "focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "hover:scale-[1.02] hover:opacity-95",
        className
      )}
      aria-label="Rei dos Calçados — Início"
    >
      <Image
        src="/logo-rei-dos-calcados.svg"
        alt="Rei dos Calçados"
        width={200}
        height={40}
        priority={priority}
        unoptimized
        className={cn(
          "w-auto transition-transform duration-300",
          compact ? "h-6 sm:h-7" : "h-7 sm:h-8 md:h-9"
        )}
      />
    </Link>
  );
}
