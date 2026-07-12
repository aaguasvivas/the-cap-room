import type { StatLine } from "./data/schemas";

/**
 * League percentiles for the Player Eval module.
 * Qualified pool: players with ≥500 total minutes in the season — percentiles
 * are computed against the actual league, not the seeded subset.
 */
export const QUALIFYING_MINUTES = 500;

export interface MetricDef {
  key: keyof Pick<
    StatLine,
    "ptsPer75" | "ts" | "usg" | "astPct" | "tovPct" | "rebPct" | "stlPer75" | "blkPer75" | "threePAr" | "ftr"
  >;
  label: string;
  /** false → lower raw value is better (percentile is inverted for display). */
  higherBetter: boolean;
  /** Format the raw value for display. */
  kind: "num1" | "num2" | "pct";
}

export const METRICS: MetricDef[] = [
  { key: "ptsPer75", label: "PTS /75", higherBetter: true, kind: "num1" },
  { key: "ts", label: "TS%", higherBetter: true, kind: "pct" },
  { key: "usg", label: "USG%", higherBetter: true, kind: "pct" },
  { key: "astPct", label: "AST%", higherBetter: true, kind: "pct" },
  { key: "tovPct", label: "TOV% (ball security)", higherBetter: false, kind: "pct" },
  { key: "rebPct", label: "REB%", higherBetter: true, kind: "pct" },
  { key: "stlPer75", label: "STL /75", higherBetter: true, kind: "num2" },
  { key: "blkPer75", label: "BLK /75", higherBetter: true, kind: "num2" },
  { key: "threePAr", label: "3PAr", higherBetter: true, kind: "pct" },
  { key: "ftr", label: "FTr", higherBetter: true, kind: "pct" },
];

export interface MetricValue {
  value: number | null;
  /** Display percentile 0–100 among qualified players; already inverted for lower-is-better metrics. */
  pctl: number | null;
}

export interface PlayerStatProfile {
  playerId: string;
  name: string;
  team: string;
  gp: number;
  min: number;
  qualified: boolean;
  metrics: Record<string, MetricValue>;
}

export function buildProfiles(players: StatLine[]): { qualifiedCount: number; profiles: PlayerStatProfile[] } {
  const qualified = players.filter((p) => p.min >= QUALIFYING_MINUTES);

  const sortedByMetric = new Map<string, number[]>();
  for (const m of METRICS) {
    const vals = qualified
      .map((p) => p[m.key])
      .filter((v): v is number => v !== null && Number.isFinite(v))
      .sort((a, b) => a - b);
    sortedByMetric.set(m.key, vals);
  }

  const pctlOf = (key: string, value: number): number => {
    const vals = sortedByMetric.get(key)!;
    if (!vals.length) return 0;
    // share of qualified players at or below this value
    let lo = 0;
    let hi = vals.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (vals[mid]! <= value) lo = mid + 1;
      else hi = mid;
    }
    return Math.round((lo / vals.length) * 100);
  };

  const profiles = players.map((p) => {
    const metrics: Record<string, MetricValue> = {};
    for (const m of METRICS) {
      const raw = p[m.key];
      if (raw === null || !Number.isFinite(raw)) {
        metrics[m.key] = { value: null, pctl: null };
      } else {
        const base = pctlOf(m.key, raw);
        metrics[m.key] = { value: raw, pctl: m.higherBetter ? base : 100 - base };
      }
    }
    return {
      playerId: p.playerId,
      name: p.name,
      team: p.team,
      gp: p.gp,
      min: p.min,
      qualified: p.min >= QUALIFYING_MINUTES,
      metrics,
    };
  });

  return { qualifiedCount: qualified.length, profiles };
}
