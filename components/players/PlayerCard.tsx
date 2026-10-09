"use client";

import Link from "next/link";
import { usd } from "@/engine/format";
import type { LeagueYear } from "@/engine/types";
import type { ApiPlayer } from "@/lib/apiTypes";
import type { PlayerStatProfile } from "@/lib/percentiles";
import { tradeUrlFor } from "@/lib/tradeUrl";
import { PercentileBars } from "./PercentileBars";
import { COMPARE_COLORS } from "./RadarChart";

const YEARS: LeagueYear[] = ["2026-27", "2027-28", "2028-29"];

function initials(name: string): string {
  return name
    .split(" ")
    .filter((w) => /^[A-ZÀ-Ž]/.test(w))
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
}

/**
 * What the seeded salary years can honestly say about when a deal ends: the
 * data window stops at 2028-29, and a few teams are seeded for 2026-27 only.
 */
function termNote(lastYear: LeagueYear | undefined, outYearsSeeded: boolean): string {
  if (lastYear === "2028-29") return "on the books through at least 2028-29";
  if (lastYear && lastYear !== "2026-27") return `signed through ${lastYear}`;
  return outYearsSeeded ? "final year" : "later years not seeded";
}

export function PlayerCard({
  player,
  profile,
  compareIndex,
  onCompareToggle,
  compareFull,
  outYearsSeeded,
}: {
  player: ApiPlayer;
  profile: PlayerStatProfile | null;
  compareIndex: number; // -1 when not selected
  onCompareToggle: () => void;
  /** Four players are already on the radar. */
  compareFull: boolean;
  /** The player's team has salary seeded beyond 2026-27 (so "final year" is a fact, not a gap). */
  outYearsSeeded: boolean;
}) {
  const lastYear = [...YEARS].reverse().find((y) => player.salary[y] !== undefined);
  const selected = compareIndex >= 0;
  const compareBlocked = !selected && (compareFull || !profile);
  const blockedReason = !profile ? "No 2025-26 stats to compare" : "The radar holds four players";

  return (
    <article
      className={`flex flex-col rounded-md border bg-graphite-raised p-4 transition-colors ${
        selected ? "border-royal-bright" : "border-graphite-line"
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-royal font-display text-base font-bold text-bone ${
            selected ? "" : "ring-1 ring-inset ring-white/10"
          }`}
          // The compare colour is a ring, not the fill: bone text on every compare
          // colour falls below AA, while bone on royal is 9.3:1.
          style={selected ? { boxShadow: `inset 0 0 0 3px ${COMPARE_COLORS[compareIndex % 4]}` } : undefined}
        >
          {initials(player.name)}
        </span>
        <div className="min-w-0">
          <h3 className="truncate font-display text-lg font-semibold text-bone">{player.name}</h3>
          <p className="font-mono text-[11px] text-silver">
            {player.team} · {player.pos} · age {player.age} · {player.contractType}
          </p>
        </div>
      </div>

      <p className="mt-2.5 font-mono text-[11.5px] tnum text-bone">
        {usd(player.salary["2026-27"])}
        <span className="text-silver">
          {" "}
          in 2026-27 · {termNote(lastYear, outYearsSeeded)}
        </span>
      </p>
      {(player.tradeRestrictions?.length ?? 0) > 0 && (
        <p className="mt-1 font-mono text-[10px] text-warn">
          {[
            player.tradeRestrictions!.includes("recently-signed") &&
              `⏳ trade-restricted until ${player.returnEligibleDate ?? "unknown"}`,
            player.tradeRestrictions!.includes("no-trade") && "no-trade clause",
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      )}

      <div className="mt-3 border-t border-graphite-line pt-3">
        {profile ? (
          <>
            <p className="mb-1.5 font-mono text-[10px] uppercase tracking-wide text-dim">
              2025-26 · {profile.gp} gp · {profile.min.toLocaleString()} min
              {!profile.qualified && " · under 500 min, percentiles thin"}
            </p>
            <PercentileBars profile={profile} />
          </>
        ) : (
          <p className="py-2 font-mono text-[11px] leading-relaxed text-dim">
            No 2025-26 NBA minutes in the snapshot (rookie or did not play). Shown as unknown rather than
            invented.
          </p>
        )}
      </div>

      <div className="mt-auto flex items-center gap-2 pt-4">
        <Link href={tradeUrlFor(player)} className="btn btn-accent text-[10px]">
          Build trade around
        </Link>
        <button
          type="button"
          onClick={onCompareToggle}
          disabled={compareBlocked}
          aria-pressed={selected}
          title={compareBlocked ? blockedReason : undefined}
          className={`btn text-[10px] ${
            selected
              ? "border-royal-bright bg-royal text-bone"
              : compareBlocked
                ? "cursor-not-allowed border-dashed border-graphite-line text-dim"
                : "btn-ghost"
          }`}
        >
          {selected ? "✓ Comparing" : "Compare"}
        </button>
      </div>
    </article>
  );
}
