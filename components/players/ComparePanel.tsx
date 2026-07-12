"use client";

import { METRICS } from "@/lib/percentiles";
import type { PlayerStatProfile } from "@/lib/percentiles";
import { Card } from "@/components/ui/bits";
import { fmtMetric } from "./PercentileBars";
import { COMPARE_COLORS, RadarChart } from "./RadarChart";

export function ComparePanel({
  profiles,
  onRemove,
}: {
  profiles: PlayerStatProfile[];
  onRemove: (playerId: string) => void;
}) {
  return (
    <Card title={`Compare — league percentiles (${profiles.length} of 4)`}>
      <div className="grid gap-4 lg:grid-cols-2">
        <RadarChart profiles={profiles} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[320px]">
            <caption className="sr-only">Exact values behind the radar chart</caption>
            <thead>
              <tr className="border-b border-graphite-line">
                <th scope="col" className="px-2 py-1.5 text-left font-mono text-[10px] uppercase tracking-wide text-silver">
                  metric
                </th>
                {profiles.map((p, i) => (
                  <th key={p.playerId} scope="col" className="px-2 py-1.5 text-right">
                    <button
                      onClick={() => onRemove(p.playerId)}
                      title="Remove from comparison"
                      className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-bone hover:text-illegal"
                    >
                      <span aria-hidden className="inline-block h-2 w-2 rounded-full" style={{ background: COMPARE_COLORS[i % 4] }} />
                      {p.name.split(" ").slice(-1)[0]} ✕
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {METRICS.map((m) => (
                <tr key={m.key} className="border-b border-graphite-line/40">
                  <td className="px-2 py-1.5 font-mono text-[10px] uppercase tracking-wide text-silver">
                    {m.label.replace(" (ball security)", "")}
                    {!m.higherBetter && <span className="text-silver/60"> ↓</span>}
                  </td>
                  {profiles.map((p) => {
                    const mv = p.metrics[m.key];
                    const has = mv && mv.value !== null;
                    return (
                      <td key={p.playerId} className="px-2 py-1.5 text-right font-mono text-[11px] tnum text-bone">
                        {has ? (
                          <>
                            {fmtMetric(m.kind, mv.value!)}
                            <span className="text-silver/60"> · {mv.pctl}</span>
                          </>
                        ) : (
                          <span className="text-silver/40">unknown</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr>
                <td className="px-2 py-1.5 font-mono text-[10px] uppercase text-silver">min / gp</td>
                {profiles.map((p) => (
                  <td key={p.playerId} className="px-2 py-1.5 text-right font-mono text-[11px] tnum text-silver">
                    {p.min.toLocaleString()} / {p.gp}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          <p className="mt-2 font-mono text-[10px] text-silver/70">
            value · league percentile among qualified players. ↓ = lower raw value is better
            (percentile already flipped so higher is always better).
          </p>
        </div>
      </div>
    </Card>
  );
}
