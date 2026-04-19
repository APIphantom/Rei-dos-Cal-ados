import { Section } from "@/components/ui/section";

export default function ProfileLoading() {
  return (
    <Section>
      <div className="mx-auto w-full max-w-3xl animate-pulse">
        <div className="mb-8 flex justify-center sm:mb-10">
          <div className="h-9 w-48 rounded-lg bg-muted/40 sm:h-10" />
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-xl backdrop-blur-xl sm:p-10">
          <div className="flex flex-col items-center gap-6 border-b border-white/10 pb-8 sm:flex-row sm:items-start">
            <div className="h-24 w-24 shrink-0 rounded-full bg-muted/50 sm:h-28 sm:w-28" />
            <div className="flex w-full flex-col items-center gap-3 sm:items-start">
              <div className="h-8 w-48 max-w-full rounded-md bg-muted/45" />
              <div className="h-5 w-32 rounded-md bg-muted/35" />
              <div className="h-6 w-24 rounded-full bg-muted/30" />
            </div>
          </div>
          <div className="py-8">
            <div className="mb-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <div className="h-3 w-24 rounded bg-muted/30" />
              <div className="h-px flex-1 bg-white/10" />
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="h-20 rounded-xl bg-muted/35" />
              <div className="h-20 rounded-xl bg-muted/35" />
              <div className="h-20 rounded-xl bg-muted/35" />
            </div>
          </div>
          <div className="flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end">
            <div className="h-12 rounded-xl bg-muted/40 sm:w-40" />
            <div className="h-12 rounded-xl bg-muted/30 sm:w-44" />
          </div>
        </div>
      </div>
    </Section>
  );
}
