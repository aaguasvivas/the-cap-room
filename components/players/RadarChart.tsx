"use client";

import type { PlayerStatProfile } from "@/lib/percentiles";

/** Validated categorical palette (all-pairs CVD-checked on #17161A). */
export const COMPARE_COLORS = ["#8253C2", "#2E9E8F", "#C46A62", "#549ACC"] as const;

const AXES = [
  { key: "ptsPer75", label: "PTS/75" },
  { key: "ts", label: "TS%" },
  { key: "usg", label: "USG%" },
  { key: "astPct", label: "AST%" },
  { key: "tovPct", label: "BALL SEC" },
  { key: "rebPct", label: "REB%" },
  { key: "stlPer75", label: "STL" },
  { key: "blkPer75", label: "BLK" },
] as const;

export function RadarChart({ profiles }: { profiles: PlayerStatProfile[] }) {
  const size = 340;
  const cx = size / 2;
  const cy = size / 2 + 4;
  const R = 118;
  const angle = (i: number) => (Math.PI * 2 * i) / AXES.length - Math.PI / 2;
  const pt = (i: number, r: number) => [cx + Math.cos(angle(i)) * r, cy + Math.sin(angle(i)) * r] as const;

  const polygon = (p: PlayerStatProfile) =>
    AXES.map((a, i) => {
      const pctl = p.metrics[a.key]?.pctl ?? 0;
      const [x, y] = pt(i, (pctl / 100) * R);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`League-percentile radar for ${profiles.map((p) => p.name).join(", ")} — exact values in the table below`}
      className="mx-auto w-full max-w-sm"
    >
      {/* grid rings at 25/50/75/100 */}
      {[25, 50, 75, 100].map((ring) => (
        <polygon
          key={ring}
          points={AXES.map((_, i) => pt(i, (ring / 100) * R).join(",")).join(" ")}
          fill="none"
          className={ring === 100 ? "stroke-graphite-line" : "stroke-graphite-line/50"}
          strokeWidth={1}
        />
      ))}
      {AXES.map((a, i) => {
        const [x, y] = pt(i, R);
        const [lx, ly] = pt(i, R + 16);
        return (
          <g key={a.key}>
            <line x1={cx} y1={cy} x2={x} y2={y} className="stroke-graphite-line/40" strokeWidth={1} />
            <text
              x={lx}
              y={ly + 3}
              textAnchor="middle"
              fontSize={8.5}
              className="fill-silver font-mono"
            >
              {a.label}
            </text>
          </g>
        );
      })}
      {profiles.map((p, idx) => (
        <g key={p.playerId}>
          <polygon
            points={polygon(p)}
            fill={COMPARE_COLORS[idx % 4]}
            fillOpacity={0.13}
            stroke={COMPARE_COLORS[idx % 4]}
            strokeWidth={2}
            strokeLinejoin="round"
          />
          {AXES.map((a, i) => {
            const pctl = p.metrics[a.key]?.pctl ?? 0;
            const [x, y] = pt(i, (pctl / 100) * R);
            return <circle key={a.key} cx={x} cy={y} r={2.6} fill={COMPARE_COLORS[idx % 4]} stroke="#17161A" strokeWidth={1.2} />;
          })}
        </g>
      ))}
      <text x={cx} y={size - 2} textAnchor="middle" fontSize={8} className="fill-silver/60 font-mono">
        rings = 25 / 50 / 75 / 100th percentile
      </text>
    </svg>
  );
}
