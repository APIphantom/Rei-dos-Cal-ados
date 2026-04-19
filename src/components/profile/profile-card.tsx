import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export function ProfileCard({ children, className }: Props) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-xl backdrop-blur-xl",
        "shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_25px_50px_-12px_rgba(0,0,0,0.55),0_0_60px_-20px_rgba(245,158,11,0.12)]",
        "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-white/[0.07] before:to-transparent before:opacity-60",
        className
      )}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
}
