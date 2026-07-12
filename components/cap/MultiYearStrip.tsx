import { SALARY_CAP } from "@/engine/constants";
import { usd, usdM } from "@/engine/format";
import type { TeamCapSheet } from "@/engine/types";

export function MultiYearStrip({ multiYear }: { multiYear: TeamCapSheet["multiYear"] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {multiYear.map((y, i) => (
        <div key={y.year} className="rounded border border-graphite-line bg-graphite-panel px-4 py-3">
          <div className="font-mono text-[11px] uppercase tracking-wideish text-silver">{y.year}</div>
          <div className="mt-1 font-display text-3xl font-semibold tnum text-bone">{usdM(y.committed)}</div>
          <div className="mt-1 text-[11px] text-silver">
            {y.countedPlayers} contracts on the books
          </div>
          <div className="mt-1.5 font-mono text-[10px] leading-relaxed text-silver/70">
            {i === 0
              ? `vs ${usd(SALARY_CAP)} cap`
              : "future cap not projected in v1 — figure is committed salary only"}
          </div>
        </div>
      ))}
    </div>
  );
}
