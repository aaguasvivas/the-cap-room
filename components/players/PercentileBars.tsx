"use client";

import { METRICS, type MetricDef, type PlayerStatProfile } from "@/lib/percentiles";

export function fmtMetric(kind: MetricDef["kind"], v: number): string {
  if (kind === "pct") return `${(v * 100).toFixed(1)}%`;
  if (kind === "num2") return v.toFixed(2);
  return v.toFixed(1);
}

/**
 * Three tiers of one hue, so strengths read at a glance without a legend
 * lookup: 80th percentile and up glows, 50th to 79th is the base purple,
 * below the median recedes. The number beside each bar is always exact.
 */
export const PCTL_TIERS = [
  { min: 80, label: "80th+", bar: "linear-gradient(90deg, #6B44A3, #B39BDF)", text: "text-royal-ink" },
  { min: 50, label: "50th to 79th", bar: "linear-gradient(90deg, #4B2A75, #7A52B5)", text: "text-silver" },
  { min: 0, label: "below 50th", bar: "#4A4555", text: "text-dim" },
] as const;

const tierFor = (pctl: number) => PCTL_TIERS.find((t) => pctl >= t.min)!;

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
        const tier = has ? tierFor(mv.pctl!) : null;
        return (
          <div key={m.key} className="grid grid-cols-[4.5rem_1fr_5.25rem] items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wide text-silver">
              {m.label.replace(" (ball security)", "")}
            </span>
            <div
              className="h-1.5 rounded-full bg-graphite-line/70"
              role="img"
              aria-label={has ? `${m.label}: ${fmtMetric(m.kind, mv.value!)}, ${mv.pctl}th percentile` : `${m.label}: unknown`}
            >
              {has && (
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.max(2, mv.pctl!)}%`, background: tier!.bar }}
                />
              )}
            </div>
            <span className="text-right font-mono text-[10px] tnum text-bone">
              {has ? (
                <>
                  {fmtMetric(m.kind, mv.value!)} <span className={tier!.text}>· {mv.pctl}</span>
                </>
              ) : (
                <span className="text-dim">unknown</span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}
