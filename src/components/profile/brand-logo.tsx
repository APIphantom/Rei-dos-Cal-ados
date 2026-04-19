import Image from "next/image";
import Link from "next/link";
import { STORE_LOGO } from "@/lib/brand";
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
        src={STORE_LOGO.src}
        alt="Rei dos Calçados"
        width={STORE_LOGO.width}
        height={STORE_LOGO.height}
        priority={priority}
        className={cn(
          "h-auto w-auto object-contain transition-transform duration-300",
          compact ? "h-7 sm:h-8" : "h-9 sm:h-10 md:h-11"
        )}
      />
    </Link>
  );
}
