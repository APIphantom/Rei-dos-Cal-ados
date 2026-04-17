"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-[hsl(var(--primary))]/90 shadow-[0_10px_30px_-12px_hsl(var(--primary)/0.35)]",
  secondary: "bg-card text-foreground hover:bg-card/80 border border-border",
  ghost: "bg-transparent text-foreground hover:bg-card/60",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-3",
  md: "h-11 px-5",
  lg: "h-12 px-6",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "font-heading inline-flex items-center justify-center rounded-xl text-xs font-bold uppercase tracking-[0.2em] transition-transform duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
