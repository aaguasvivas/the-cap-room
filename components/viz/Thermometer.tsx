"use client";

import { CAP_LINES } from "@/engine/constants";
import { usd, usdM } from "@/engine/format";

/**
 * The gauge: team salary as a vertical level against the five CBA lines.
 * This is a threshold gauge, not a magnitude bar: the scale window is
 * [$130M, $245M] and says so with a broken-axis mark at its base.
 * Exact distances live beside it in HTML (LineDistances), so the SVG only
 * carries short labels and stays legible at phone width.
 */
const DOMAIN_MIN = 130_000_000;
const DOMAIN_MAX = 245_000_000;

const SHORT: Record<string, string> = {
  floor: "Floor",
  cap: "Cap",
  tax: "Tax",
  apron1: "Apron 1",
  apron2: "Apron 2",
};

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
  const H = compact ? 190 : 330;
  const W = compact ? 250 : 260;
  const tubeX = compact ? 92 : 96;
  const tubeW = compact ? 34 : 48;
  const topPad = 14;
  const bottomPad = 20;
  const usable = H - topPad - bottomPad;
  const fs = compact ? 8.5 : 11;

  const yFor = (v: number) => {
    const t = Math.min(1, Math.max(0, (v - DOMAIN_MIN) / (DOMAIN_MAX - DOMAIN_MIN)));
    return H - bottomPad - t * usable;
  };

  const fillTop = yFor(total);
  const fillH = H - bottomPad - fillTop;
  const gradId = compact ? "thermo-fill-c" : "thermo-fill";

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`Team salary ${usd(total)} against the cap lines`}
      className={compact ? "w-full max-w-full" : "mx-auto w-full max-w-[260px]"}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#4B2A75" />
          <stop offset="1" stopColor="#8E63CC" />
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

      {/* Fill: the one orchestrated moment (reduced-motion kills it) */}
      <rect
        x={tubeX + 2}
        width={tubeW - 4}
        rx={3}
        y={fillTop + 2}
        height={Math.max(0, fillH - 2)}
        fill={`url(#${gradId})`}
        style={
          animate
            ? { transformOrigin: `${tubeX + tubeW / 2}px ${H - bottomPad}px`, animation: "thermo-rise 900ms cubic-bezier(.2,.7,.2,1) both" }
            : undefined
        }
      />

      {/* Pre-trade ghost tick */}
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
        // In compact mode the floor and first-apron labels sit left of the tube,
        // where the level label also lives; drop them when they would collide.
        const leftSide = compact && (line.key === "apron1" || line.key === "floor");
        if (leftSide && Math.abs(y - fillTop) <= 13) return <LineOnly key={line.key} y={y} line={line.key} above={above} tubeX={tubeX} tubeW={tubeW} />;
        return (
          <g key={line.key}>
            <LineOnly y={y} line={line.key} above={above} tubeX={tubeX} tubeW={tubeW} />
            <text
              x={leftSide ? tubeX - 8 : tubeX + tubeW + 10}
              y={y + fs * 0.35}
              textAnchor={leftSide ? "end" : "start"}
              fontSize={fs}
              className={`font-mono ${above ? "fill-bone" : "fill-silver"}`}
            >
              {compact ? SHORT[line.key]!.toLowerCase() : SHORT[line.key]} {usdM(line.amount)}
            </text>
          </g>
        );
      })}

      {/* Current level marker + figure */}
      <line x1={tubeX - 8} x2={tubeX + tubeW + 8} y1={fillTop} y2={fillTop} stroke="#B39BDF" strokeWidth={2} />
      <text
        x={tubeX - 10}
        y={fillTop + (compact ? 4 : 5)}
        textAnchor="end"
        fontSize={compact ? 11 : 15}
        fontWeight={600}
        className="tnum fill-bone font-display"
      >
        {usdM(total)} ◂
      </text>

      {/* Broken-axis mark: the window starts at $130M, not $0 */}
      <text x={tubeX + tubeW / 2} y={H - 5} textAnchor="middle" fontSize={compact ? 8.5 : 9.5} className="fill-dim font-mono">
        ⌇ scale {usdM(DOMAIN_MIN)} to {usdM(DOMAIN_MAX)}
      </text>
    </svg>
  );
}

function LineOnly({ y, line, above, tubeX, tubeW }: { y: number; line: string; above: boolean; tubeX: number; tubeW: number }) {
  return (
    <line
      x1={tubeX - 6}
      x2={tubeX + tubeW + 6}
      y1={y}
      y2={y}
      className={above ? "stroke-bone/70" : "stroke-silver/50"}
      strokeWidth={line === "cap" ? 1.5 : 1}
      strokeDasharray={line === "floor" ? "4 3" : undefined}
    />
  );
}
