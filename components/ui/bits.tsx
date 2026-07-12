import type { ApronStatus } from "@/engine/types";

export function Card({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-md border border-graphite-line bg-graphite-raised ${className}`}>
      {(title || action) && (
        <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-graphite-line px-4 py-2.5">
          {title ? (
            <h2 className="font-display text-base font-semibold uppercase tracking-wideish text-silver">
              {title}
            </h2>
          ) : (
            <span />
          )}
          {action}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

const STATUS_TONE: Record<ApronStatus, string> = {
  "under-cap": "border-royal-soft/50 text-royal-soft",
  "over-cap": "border-silver/50 text-silver",
  taxpayer: "border-bone/40 text-bone",
  "first-apron": "border-warn/60 text-warn",
  "second-apron": "border-warn text-warn",
};

export function StatusChip({ status, label }: { status: ApronStatus; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide ${STATUS_TONE[status]}`}
    >
      <span aria-hidden className="text-[9px]">◆</span>
      {label}
    </span>
  );
}

export function WarnChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-sm border border-warn/70 px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide text-warn">
      <span aria-hidden>▲</span> {children}
    </span>
  );
}
