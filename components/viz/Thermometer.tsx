"use client";

import { CAP_LINES } from "@/engine/constants";
import { usd, usdM } from "@/engine/format";

/**
 * The hero gauge: team salary as a vertical level against the five CBA lines.
 * This is a threshold gauge, not a magnitude bar: the scale window is
 * [$130M, $245M] and says so with a broken-axis mark at its base.
 */
const DOMAIN_MIN = 130_000_000;
const DOMAIN_MAX = 245_000_000;

export function Thermometer({
  total,
  preTotal,
  compact = false,
  animate = true,
}: {
  total: number;
  /** When set (trade preview), a ghost tick marks the pre-trade level. */
  preTotal?: number;
  compact?: boolean;
  animate?: boolean;
}) {
  const H = compact ? 190 : 320;
  const W = compact ? 250 : 560;
  const tubeX = compact ? 92 : 60;
  const tubeW = compact ? 34 : 56;
  const topPad = 14;
  const bottomPad = 20;
  const usable = H - topPad - bottomPad;

  const yFor = (v: number) => {
    const t = Math.min(1, Math.max(0, (v - DOMAIN_MIN) / (DOMAIN_MAX - DOMAIN_MIN)));
    return H - bottomPad - t * usable;
  };

  const fillTop = yFor(total);
  const fillH = H - bottomPad - fillTop;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`Team salary ${usd(total)} against the cap lines`}
      className="w-full max-w-full"
    >
      <defs>
        <linearGradient id="thermo-fill" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#4B2A75" />
          <stop offset="1" stopColor="#8253C2" />
        </linearGradient>
      </defs>

      {/* Tube */}
      <rect
        x={tubeX}
        y={topPad}
        width={tubeW}
        height={usable}
        rx={4}
        className="fill-graphite-panel stroke-graphite-line"
        strokeWidth={1}
      />

      {/* Fill: the one orchestrated moment (CSS transition; reduced-motion kills it) */}
      <rect
        x={tubeX + 2}
        width={tubeW - 4}
        rx={3}
        y={fillTop + 2}
        height={Math.max(0, fillH - 2)}
        fill="url(#thermo-fill)"
        style={
          animate
            ? { transformOrigin: `${tubeX + tubeW / 2}px ${H - bottomPad}px`, animation: "thermo-rise 900ms cubic-bezier(.2,.7,.2,1) both" }
            : undefined
        }
      />

      {/* Pre-trade ghost tick (label lives outside the SVG in compact mode) */}
      {preTotal !== undefined && preTotal !== total && (
        <line
          x1={tubeX - 4}
          x2={tubeX + tubeW + 4}
          y1={yFor(preTotal)}
          y2={yFor(preTotal)}
          className="stroke-silver"
          strokeWidth={1.5}
          strokeDasharray="2 3"
        />
      )}

      {/* Cap lines */}
      {CAP_LINES.map((line) => {
        const y = yFor(line.amount);
        const above = total > line.amount;
        const dist = line.amount - total;
        return (
          <g key={line.key}>
            <line
              x1={tubeX - 6}
              x2={tubeX + tubeW + 6}
              y1={y}
              y2={y}
              className={above ? "stroke-bone/70" : "stroke-silver/50"}
              strokeWidth={line.key === "cap" ? 1.5 : 1}
              strokeDasharray={line.key === "floor" ? "4 3" : undefined}
            />
            {!compact && (
              <text x={tubeX + tubeW + 12} y={y + 3.5} fontSize={11} className="font-mono">
                <tspan className="fill-bone">
                  {line.label} · {usd(line.amount)} ·{" "}
                </tspan>
                <tspan className={above ? "fill-warn" : "fill-silver"}>
                  {above ? `${usdM(-dist)} over` : `${usdM(dist)} of room`}
                </tspan>
              </text>
            )}
            {compact && (line.key === "cap" || line.key === "tax" || line.key === "apron2") && (
              <text x={tubeX + tubeW + 10} y={y + 3} fontSize={8.5} className="fill-silver font-mono">
                {line.key === "cap" ? "cap" : line.key === "tax" ? "tax" : "apron 2"} {usdM(line.amount)}
              </text>
            )}
            {compact && (line.key === "apron1" || line.key === "floor") && Math.abs(y - fillTop) > 13 && (
              <text x={tubeX - 8} y={y + 3} textAnchor="end" fontSize={8.5} className="fill-silver font-mono">
                {line.key === "apron1" ? "apron 1" : "floor"} {usdM(line.amount)}
              </text>
            )}
          </g>
        );
      })}

      {/* Current level marker + hero figure */}
      <line
        x1={tubeX - 8}
        x2={tubeX + tubeW + 8}
        y1={fillTop}
        y2={fillTop}
        stroke="#8E6BC2"
        strokeWidth={2}
      />
      {!compact && (
        <g>
          <text x={4} y={fillTop - 6} fontSize={11} className="fill-silver font-mono">
            team salary
          </text>
          <text
            x={4}
            y={fillTop + 16}
            fontSize={20}
            className="fill-bone font-display tnum"
            fontWeight={600}
          >
            {usdM(total)}
          </text>
        </g>
      )}
      {compact && (
        <text x={tubeX - 8} y={fillTop + 4} textAnchor="end" fontSize={11} fontWeight={600} className="fill-bone font-display tnum">
          {usdM(total)} ◂
        </text>
      )}

      {/* Broken-axis mark: the window starts at $130M, not $0 */}
      <text x={tubeX + tubeW / 2} y={H - 6} textAnchor="middle" fontSize={8.5} className="fill-silver/70 font-mono">
        ⌇ scale {usdM(DOMAIN_MIN)}–{usdM(DOMAIN_MAX)}
      </text>
    </svg>
  );
}
