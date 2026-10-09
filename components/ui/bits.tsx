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
            <h2 className="font-display text-base font-semibold uppercase tracking-wideish text-silver">{title}</h2>
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

/** Module title row: display heading, a quiet note, and the page's own controls. */
export function PageHeader({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
      <div className="flex items-baseline gap-3">
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-bone md:text-4xl">{title}</h1>
        {note && <span className="hidden font-mono text-[11px] text-dim sm:inline">{note}</span>}
      </div>
      {children && <div className="flex min-w-0 flex-wrap items-center gap-2 sm:ml-auto">{children}</div>}
    </div>
  );
}

const STATUS_TONE: Record<ApronStatus, string> = {
  "under-cap": "border-legal/60 text-legal",
  "over-cap": "border-silver/50 text-silver",
  taxpayer: "border-warn/60 text-warn",
  "first-apron": "border-warn text-warn",
  "second-apron": "border-illegal text-illegal",
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

/** Small inline contract flag (NTC, NG, 2W, trade-restricted date). */
export function Flag({ tone = "neutral", title, children }: { tone?: "neutral" | "warn"; title?: string; children: React.ReactNode }) {
  return (
    <span
      title={title}
      className={`ml-1.5 inline-block rounded-sm border px-1 align-middle font-mono text-[9px] uppercase leading-[1.5] ${
        tone === "warn" ? "border-warn/60 text-warn" : "border-silver/40 text-silver"
      }`}
    >
      {children}
    </span>
  );
}
