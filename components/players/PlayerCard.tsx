"use client";

import Link from "next/link";
import { usd } from "@/engine/format";
import type { LeagueYear } from "@/engine/types";
import type { ApiPlayer } from "@/lib/apiTypes";
import type { PlayerStatProfile } from "@/lib/percentiles";
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

export function PlayerCard({
  player,
  profile,
  compareIndex,
  onCompareToggle,
  compareDisabled,
}: {
  player: ApiPlayer;
  profile: PlayerStatProfile | null;
  compareIndex: number; // -1 when not selected
  onCompareToggle: () => void;
  compareDisabled: boolean;
}) {
  const lastYear = [...YEARS].reverse().find((y) => player.salary[y] !== undefined);
  const selected = compareIndex >= 0;

  return (
    <article
      className={`flex flex-col rounded-md border bg-graphite-raised p-4 transition-colors ${
        selected ? "border-royal-bright" : "border-graphite-line"
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-display text-base font-bold text-bone"
          style={{ background: selected ? COMPARE_COLORS[compareIndex % 4] : "#4B2A75" }}
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
        <span className="text-silver"> in 2026-27{lastYear && lastYear !== "2026-27" ? ` · under contract through ${lastYear}` : " · final year"}</span>
      </p>
      {(player.tradeRestrictions?.length ?? 0) > 0 && (
        <p className="mt-1 font-mono text-[10px] text-warn">
          {player.tradeRestrictions!.includes("recently-signed") &&
            `⏳ trade-restricted until ${player.returnEligibleDate ?? "unknown"}`}
          {player.tradeRestrictions!.includes("no-trade") && " · no-trade clause"}
        </p>
      )}

      <div className="mt-3 border-t border-graphite-line pt-3">
        {profile ? (
          <>
            <p className="mb-1.5 font-mono text-[10px] uppercase tracking-wide text-silver/80">
              2025-26 · {profile.gp} gp · {profile.min.toLocaleString()} min
              {!profile.qualified && " · under 500 min (percentiles thin)"}
            </p>
            <PercentileBars profile={profile} />
          </>
        ) : (
          <p className="py-2 font-mono text-[11px] leading-relaxed text-silver/70">
            No 2025-26 NBA stats in the snapshot — rookie or didn't play. Values stay
            &ldquo;unknown&rdquo; rather than invented.
          </p>
        )}
      </div>

      <div className="mt-auto flex items-center gap-2 pt-3">
        <Link
          href={
            player.team === "SAC"
              ? `/trade?a=SAC&b=LAL&give=${player.playerId}`
              : `/trade?a=SAC&b=${player.team}&get=${player.playerId}`
          }
          className="rounded border border-royal-bright/60 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wide text-royal-soft hover:bg-royal hover:text-bone"
        >
          build trade around
        </Link>
        <button
          onClick={onCompareToggle}
          disabled={!selected && compareDisabled}
          aria-pressed={selected}
          className={`rounded border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wide transition-colors ${
            selected
              ? "border-royal-bright bg-royal text-bone"
              : compareDisabled
                ? "cursor-not-allowed border-graphite-line text-silver/40"
                : "border-graphite-line text-silver hover:border-royal-soft hover:text-bone"
          }`}
        >
          {selected ? "✓ comparing" : "compare"}
        </button>
      </div>
    </article>
  );
}
