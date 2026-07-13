"use client";

import { CAP_LINES } from "@/engine/constants";
import { usdM } from "@/engine/format";
import type { ApronStatus, TeamCode } from "@/engine/types";

export interface BoardTeam {
  team: TeamCode;
  teamName: string;
  total: number;
  status: ApronStatus;
}

/**
 * The league board: every seeded team's salary as a column on one shared
 * scale, with the five CBA lines drawn straight across. The first three
 * seconds of the demo say "cap tool" before a single word is read.
 */
const MIN = 130_000_000;
const MAX = 245_000_000;
const W = 760;
const H = 330;
const TOP = 26;
const BOTTOM = 44;
const LEFT = 16;
const RIGHT = 152;

const SHORT: Record<string, string> = {
  floor: "Floor",
  cap: "Cap",
  tax: "Tax",
  apron1: "First apron",
  apron2: "Second apron",
};

export function LeagueBoard({ teams, asOf }: { teams: BoardTeam[]; asOf: string }) {
  const plotW = W - LEFT - RIGHT;
  const plotH = H - TOP - BOTTOM;
  const yFor = (v: number) =>
    TOP + plotH - ((Math.min(MAX, Math.max(MIN, v)) - MIN) / (MAX - MIN)) * plotH;
  const yBase = yFor(MIN);

  const slot = plotW / teams.length;
  const colW = Math.min(46, slot * 0.55);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[680px]">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`2026-27 team salaries for ${teams.length} seeded teams against the five CBA lines`}
          className="w-full"
        >
          <defs>
            <linearGradient id="board-fill" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0" stopColor="#4B2A75" />
              <stop offset="1" stopColor="#8253C2" />
            </linearGradient>
          </defs>

          {/* The five lines, straight across the league */}
          {CAP_LINES.map((line) => {
            const y = yFor(line.amount);
            return (
              <g key={line.key}>
                <line
                  x1={LEFT}
                  x2={W - RIGHT + 4}
                  y1={y}
                  y2={y}
                  className={line.key === "cap" ? "stroke-bone/50" : "stroke-graphite-line"}
                  strokeWidth={line.key === "cap" ? 1.4 : 1}
                  strokeDasharray={line.key === "floor" ? "4 3" : undefined}
                />
                <text x={W - RIGHT + 10} y={y + 3.5} fontSize={10.5} className="font-mono fill-silver">
                  {SHORT[line.key]} · {usdM(line.amount)}
                </text>
              </g>
            );
          })}

          {/* Baseline */}
          <line x1={LEFT} x2={W - RIGHT + 4} y1={yBase} y2={yBase} className="stroke-silver/40" strokeWidth={1.2} />

          {/* One column per team, tallest first, each a link to its cap sheet */}
          {teams.map((t, i) => {
            const x = LEFT + slot * i + (slot - colW) / 2;
            const yTop = yFor(t.total);
            const isSac = t.team === "SAC";
            return (
              <a
                key={t.team}
                href={`/cap?team=${t.team}`}
                aria-label={`${t.teamName}: ${usdM(t.total)} — open cap sheet`}
                className="group outline-offset-2"
              >
                <rect
                  x={x}
                  y={yTop}
                  width={colW}
                  height={yBase - yTop}
                  rx={3}
                  fill="url(#board-fill)"
                  stroke={isSac ? "#8E6BC2" : "transparent"}
                  strokeWidth={isSac ? 1.5 : 0}
                  style={{
                    transformOrigin: `${x + colW / 2}px ${yBase}px`,
                    animation: `thermo-rise 800ms cubic-bezier(.2,.7,.2,1) ${i * 70}ms both`,
                  }}
                  className="group-hover:opacity-90"
                />
                <text
                  x={x + colW / 2}
                  y={yTop - 7}
                  textAnchor="middle"
                  fontSize={11.5}
                  fontWeight={600}
                  className="font-display tnum fill-bone"
                >
                  {usdM(t.total)}
                </text>
                <text
                  x={x + colW / 2}
                  y={yBase + 16}
                  textAnchor="middle"
                  fontSize={11}
                  className={`font-mono ${isSac ? "fill-bone" : "fill-silver"}`}
                >
                  {isSac ? "◆ SAC" : t.team}
                </text>
              </a>
            );
          })}

          <text x={LEFT} y={H - 6} fontSize={9} className="font-mono fill-silver/60">
            ⌇ scale {usdM(MIN)}–{usdM(MAX)} · click a team for its cap sheet · data as of {asOf}
          </text>
        </svg>
      </div>
    </div>
  );
}
