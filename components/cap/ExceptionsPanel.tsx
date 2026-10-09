import { usd } from "@/engine/format";
import type { ExceptionInfo } from "@/engine/types";

/** Live exceptions first; unavailable ones stay listed (with the reason) but recede. */
export function ExceptionsPanel({ exceptions }: { exceptions: ExceptionInfo[] }) {
  const sorted = [...exceptions].sort((a, b) => Number(b.available) - Number(a.available));
  return (
    <ul className="space-y-2.5">
      {sorted.map((ex) => (
        <li
          key={ex.id}
          className={`rounded border px-3 py-2.5 ${
            ex.available ? "border-graphite-line bg-graphite-panel" : "border-dashed border-graphite-line"
          }`}
        >
          <div className="flex items-baseline justify-between gap-2">
            <span className={`text-[13px] font-semibold ${ex.available ? "text-bone" : "text-silver"}`}>
              {ex.name}
              {!ex.available && (
                <span className="ml-2 font-mono text-[10px] font-normal uppercase tracking-wide text-dim">unavailable</span>
              )}
            </span>
            <span className={`font-mono text-[13px] tnum ${ex.available ? "text-bone" : "text-dim line-through decoration-dim/60"}`}>
              {usd(ex.amount)}
            </span>
          </div>
          <p className={`mt-1 text-[12px] leading-snug ${ex.available ? "text-silver" : "text-dim"}`}>{ex.reason}</p>
          {ex.available && ex.hardCapNote && (
            <p className="mt-1.5 flex items-start gap-1.5 text-[12px] leading-snug text-warn">
              <span aria-hidden>▲</span>
              <span>{ex.hardCapNote}</span>
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
