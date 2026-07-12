"use client";

import { METRICS, type MetricDef, type PlayerStatProfile } from "@/lib/percentiles";

export function fmtMetric(kind: MetricDef["kind"], v: number): string {
  if (kind === "pct") return `${(v * 100).toFixed(1)}%`;
  if (kind === "num2") return v.toFixed(2);
  return v.toFixed(1);
}

export function PercentileBars({
  profile,
  keys,
}: {
  profile: PlayerStatProfile;
  keys?: string[];
}) {
  const metrics = METRICS.filter((m) => !keys || keys.includes(m.key));
  return (
    <div className="space-y-1.5">
      {metrics.map((m) => {
        const mv = profile.metrics[m.key];
        const has = mv && mv.value !== null && mv.pctl !== null;
        return (
          <div key={m.key} className="grid grid-cols-[5.5rem_1fr_4.5rem] items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wide text-silver">
              {m.label.replace(" (ball security)", "")}
            </span>
            <div
              className="h-1.5 rounded-full bg-graphite-line/60"
              role="img"
              aria-label={has ? `${m.label}: ${fmtMetric(m.kind, mv.value!)}, ${mv.pctl}th percentile` : `${m.label}: unknown`}
            >
              {has && (
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.max(2, mv.pctl!)}%`,
                    background: "linear-gradient(90deg, #4B2A75, #8253C2)",
                  }}
                />
              )}
            </div>
            <span className="text-right font-mono text-[10px] tnum text-bone">
              {has ? (
                <>
                  {fmtMetric(m.kind, mv.value!)} <span className="text-silver/70">· {mv.pctl}</span>
                </>
              ) : (
                <span className="text-silver/50">unknown</span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}
