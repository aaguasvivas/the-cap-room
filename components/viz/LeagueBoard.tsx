import Link from "next/link";
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
 * The league board: every seeded team's salary on one shared scale, with the
 * five CBA lines drawn straight across and the tax/apron territory shaded.
 * The first three seconds of the demo say "cap tool" before a word is read.
 *
 * Columns on wide screens; on narrower ones the same chart turns sideways
 * into rows, so nothing is cropped or needs a horizontal scroll.
 */
const MIN = 130_000_000;
const MAX = 235_000_000;
const HOME = "SAC";

const LINE = Object.fromEntries(CAP_LINES.map((l) => [l.key, l.amount])) as Record<
  (typeof CAP_LINES)[number]["key"],
  number
>;

/** Shaded territory between lines: the further up, the more the CBA restricts. */
const ZONES = [
  { from: LINE.tax, to: LINE.apron1, fill: "rgba(214,154,60,0.035)", label: "tax" },
  { from: LINE.apron1, to: LINE.apron2, fill: "rgba(214,154,60,0.07)", label: "first apron" },
  { from: LINE.apron2, to: MAX, fill: "url(#apron2-hatch)", css: "repeating-linear-gradient(135deg, rgba(239,91,91,0.10) 0 1px, transparent 1px 7px)", label: "second apron" },
] as const;

const SHORT: Record<string, string> = {
  floor: "Floor",
  cap: "Cap",
  tax: "Tax",
  apron1: "First apron",
  apron2: "Second apron",
};

const frac = (v: number) => (Math.min(MAX, Math.max(MIN, v)) - MIN) / (MAX - MIN);

export function LeagueBoard({ teams, asOf }: { teams: BoardTeam[]; asOf: string }) {
  return (
    <figure>
      <figcaption className="sr-only">
        2026-27 team salary for {teams.length} seeded teams against the salary floor, cap, luxury tax and both aprons.
        Each team links to its cap sheet.
      </figcaption>
      <div className="hidden lg:block">
        <Columns teams={teams} />
      </div>
      <div className="lg:hidden">
        <Rows teams={teams} />
      </div>
      <p className="mt-3 font-mono text-[10px] text-dim">
        ⌇ scale {usdM(MIN)} to {usdM(MAX)} · ◆ SAC is the home desk · tap a team for its cap sheet · data as of {asOf}
      </p>
    </figure>
  );
}

function Columns({ teams }: { teams: BoardTeam[] }) {
  const W = 760;
  const H = 316;
  const TOP = 22;
  const BOTTOM = 30;
  const LEFT = 8;
  const RIGHT = 150;
  const plotW = W - LEFT - RIGHT;
  const plotH = H - TOP - BOTTOM;
  const yFor = (v: number) => TOP + plotH - frac(v) * plotH;
  const yBase = yFor(MIN);
  const slot = plotW / teams.length;
  const colW = Math.min(46, slot * 0.55);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <defs>
        <linearGradient id="board-fill" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#3D2462" />
          <stop offset="1" stopColor="#6E48A6" />
        </linearGradient>
        {/* Above the second apron: hatched, the CBA's no-go territory */}
        <pattern id="apron2-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="7" height="7" fill="rgba(239,91,91,0.04)" />
          <line x1="0" y1="0" x2="0" y2="7" stroke="rgba(239,91,91,0.16)" strokeWidth="1.2" />
        </pattern>
        <linearGradient id="board-fill-home" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#4B2A75" />
          <stop offset="1" stopColor="#9673D0" />
        </linearGradient>
      </defs>

      {ZONES.map((z) => (
        <rect key={z.label} x={LEFT} width={plotW + 4} y={yFor(z.to)} height={yFor(z.from) - yFor(z.to)} fill={z.fill} />
      ))}

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
            <text x={W - RIGHT + 12} y={y + 3.5} fontSize={10.5} className="fill-silver font-mono">
              {SHORT[line.key]} · {usdM(line.amount)}
            </text>
          </g>
        );
      })}

      <line x1={LEFT} x2={W - RIGHT + 4} y1={yBase} y2={yBase} className="stroke-silver/40" strokeWidth={1.2} />

      {teams.map((t, i) => {
        const x = LEFT + slot * i + (slot - colW) / 2;
        const yTop = yFor(t.total);
        const home = t.team === HOME;
        return (
          <Link
            key={t.team}
            href={`/cap?team=${t.team}`}
            aria-label={`${t.teamName}: ${usdM(t.total)}. Open cap sheet`}
            className="group"
          >
            <rect
              x={x}
              y={yTop}
              width={colW}
              height={yBase - yTop}
              rx={3}
              fill={home ? "url(#board-fill-home)" : "url(#board-fill)"}
              stroke={home ? "#B39BDF" : "transparent"}
              strokeWidth={home ? 1.5 : 0}
              style={{
                transformOrigin: `${x + colW / 2}px ${yBase}px`,
                animation: `thermo-rise 800ms cubic-bezier(.2,.7,.2,1) ${i * 60}ms both`,
              }}
              className="transition-[filter] group-hover:brightness-125"
            />
            {/* Halo keeps the figure legible when it lands on a line */}
            <text
              x={x + colW / 2}
              y={yTop - 7}
              textAnchor="middle"
              fontSize={11.5}
              fontWeight={600}
              stroke="#1E1D22"
              strokeWidth={4}
              strokeLinejoin="round"
              paintOrder="stroke"
              className="tnum fill-bone font-display"
            >
              {usdM(t.total)}
            </text>
            <text
              x={x + colW / 2}
              y={yBase + 17}
              textAnchor="middle"
              fontSize={11}
              className={`font-mono ${home ? "fill-royal-ink" : "fill-silver"} group-hover:fill-bone`}
            >
              {home ? "◆ SAC" : t.team}
            </text>
          </Link>
        );
      })}
    </svg>
  );
}

function Rows({ teams }: { teams: BoardTeam[] }) {
  const pct = (v: number) => `${(frac(v) * 100).toFixed(2)}%`;
  // Two label rows so the close tax / first-apron pair never collide.
  const labels: { key: keyof typeof LINE; text: string; row: 0 | 1 }[] = [
    { key: "floor", text: "Floor", row: 0 },
    { key: "cap", text: "Cap", row: 1 },
    { key: "tax", text: "Tax", row: 0 },
    { key: "apron1", text: "Apron 1", row: 1 },
    { key: "apron2", text: "Apron 2", row: 0 },
  ];

  return (
    <div className="grid grid-cols-[2.75rem_1fr_3.75rem] items-center gap-x-2.5">
      {/* Line labels */}
      <div aria-hidden className="relative col-start-2 row-start-1 mb-1.5 h-8">
        {labels.map((l) => (
          <span
            key={l.key}
            className={`absolute -translate-x-1/2 whitespace-nowrap font-mono text-[10px] ${
              l.key === "cap" ? "text-bone" : "text-silver"
            }`}
            style={{ left: pct(LINE[l.key]), top: l.row === 0 ? 0 : 16 }}
          >
            {l.text}
          </span>
        ))}
      </div>

      {/* Lines + zones, drawn once behind every row */}
      <div aria-hidden className="relative col-start-2 self-stretch" style={{ gridRow: `2 / span ${teams.length}` }}>
        {ZONES.map((z) => (
          <div
            key={z.label}
            className="absolute inset-y-0"
            style={{ left: pct(z.from), width: `calc(${pct(z.to)} - ${pct(z.from)})`, background: "css" in z ? z.css : z.fill }}
          />
        ))}
        {CAP_LINES.map((l) => (
          <div
            key={l.key}
            className={`absolute inset-y-0 w-px ${
              l.key === "cap" ? "bg-bone/50" : l.key === "floor" ? "border-l border-dashed border-silver/30" : "bg-graphite-line"
            }`}
            style={{ left: pct(l.amount) }}
          />
        ))}
      </div>

      {teams.map((t, i) => {
        const home = t.team === HOME;
        return (
          <Link
            key={t.team}
            href={`/cap?team=${t.team}`}
            aria-label={`${t.teamName}: ${usdM(t.total)}. Open cap sheet`}
            className="group col-span-3 col-start-1 grid grid-cols-subgrid items-center py-[5px]"
            style={{ gridRow: i + 2 }}
          >
            <span className={`font-mono text-[11px] ${home ? "text-royal-ink" : "text-silver"} group-hover:text-bone`}>
              {home ? "◆ SAC" : t.team}
            </span>
            <span className="relative z-10 h-4">
              <span
                className="absolute inset-y-0 left-0 rounded-r-[3px] group-hover:brightness-125"
                style={{
                  width: pct(t.total),
                  background: home
                    ? "linear-gradient(90deg, #4B2A75, #9673D0)"
                    : "linear-gradient(90deg, #3D2462, #6E48A6)",
                  boxShadow: home ? "inset 0 0 0 1px #B39BDF" : undefined,
                  transformOrigin: "left",
                  animation: `bar-grow 700ms cubic-bezier(.2,.7,.2,1) ${i * 50}ms both`,
                }}
              />
            </span>
            <span className="tnum text-right font-display text-[13px] font-semibold text-bone">{usdM(t.total)}</span>
          </Link>
        );
      })}
    </div>
  );
}
