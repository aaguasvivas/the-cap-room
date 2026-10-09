import { SALARY_CAP } from "@/engine/constants";
import { usd, usdM } from "@/engine/format";
import type { TeamCapSheet } from "@/engine/types";

export function MultiYearStrip({ multiYear }: { multiYear: TeamCapSheet["multiYear"] }) {
  const peak = Math.max(...multiYear.map((y) => y.committed), SALARY_CAP);
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {multiYear.map((y, i) => {
        // No NBA team has zero commitments a year out; zero here means the
        // seed only captured 2026-27 for this team, so say so instead of "$0M".
        const unseeded = i > 0 && y.countedPlayers === 0;
        return (
          <div key={y.year} className="rounded-sm border border-graphite-line bg-graphite-panel px-4 py-3">
            <div className="eyebrow">{y.year}</div>
            <div className={`mt-1 font-display text-3xl font-semibold tnum ${unseeded ? "text-dim" : "text-bone"}`}>
              {unseeded ? "Not seeded" : usdM(y.committed)}
            </div>
            {/* Committed money as a share of this year's cap: a quick read on future flexibility */}
            <div aria-hidden className="relative mt-2 h-1.5 rounded-full bg-graphite-line">
              <div
                className="h-full rounded-full bg-linear-to-r from-royal to-royal-soft"
                style={{ width: `${(y.committed / peak) * 100}%` }}
              />
              {i === 0 && (
                <div className="absolute -top-1 h-3.5 w-px bg-bone/70" style={{ left: `${(SALARY_CAP / peak) * 100}%` }} />
              )}
            </div>
            <div className="mt-2 text-[12px] text-silver">
              {unseeded
                ? "out-years not yet captured for this team"
                : `${y.countedPlayers} cap hit${y.countedPlayers === 1 ? "" : "s"} on the books`}
            </div>
            <div className="mt-1 font-mono text-[10px] leading-relaxed text-dim">
              {i === 0 ? `tick marks the ${usd(SALARY_CAP)} cap` : "committed salary only; future caps not projected"}
            </div>
          </div>
        );
      })}
    </div>
  );
}
