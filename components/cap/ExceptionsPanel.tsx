import { usd } from "@/engine/format";
import type { ExceptionInfo } from "@/engine/types";

export function ExceptionsPanel({ exceptions }: { exceptions: ExceptionInfo[] }) {
  return (
    <ul className="space-y-3">
      {exceptions.map((ex) => (
        <li
          key={ex.id}
          className={`rounded border px-3 py-2.5 ${
            ex.available ? "border-graphite-line bg-graphite-panel" : "border-graphite-line/50 opacity-55"
          }`}
        >
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[13px] font-semibold text-bone">{ex.name}</span>
            <span className="font-mono text-[13px] tnum text-bone">{usd(ex.amount)}</span>
          </div>
          <p className="mt-1 text-[12px] leading-snug text-silver">{ex.reason}</p>
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
