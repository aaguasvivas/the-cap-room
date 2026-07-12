"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { PlayersResponse, TeamsResponse } from "@/lib/apiTypes";
import { normalizeName } from "@/lib/names";
import type { PlayerStatProfile } from "@/lib/percentiles";
import { useApi } from "@/lib/hooks";
import { ComparePanel } from "./ComparePanel";
import { PlayerCard } from "./PlayerCard";

interface StatsResponse {
  season: string;
  pulledAt: string | null;
  qualifiedCount: number;
  profiles: PlayerStatProfile[];
}

const POSITIONS = ["PG", "SG", "SF", "PF", "C"] as const;

export function PlayersClient() {
  const params = useSearchParams();
  const players = useApi<PlayersResponse>("/api/players");
  const teams = useApi<TeamsResponse>("/api/teams");
  const stats = useApi<StatsResponse>("/api/stats");

  const [team, setTeam] = useState((params.get("team") ?? "SAC").toUpperCase());
  const [pos, setPos] = useState<string | null>(null);
  const [q, setQ] = useState(params.get("q") ?? "");
  const [compare, setCompare] = useState<string[]>([]);

  const statByName = useMemo(() => {
    const map = new Map<string, PlayerStatProfile>();
    for (const p of stats.data?.profiles ?? []) map.set(normalizeName(p.name), p);
    return map;
  }, [stats.data]);

  const list = useMemo(() => {
    let l = players.data?.players ?? [];
    if (team !== "ALL") l = l.filter((p) => p.team === team);
    if (pos) l = l.filter((p) => p.pos === pos);
    if (q.trim()) l = l.filter((p) => p.name.toLowerCase().includes(q.trim().toLowerCase()));
    return [...l].sort((a, b) => (b.salary["2026-27"] ?? 0) - (a.salary["2026-27"] ?? 0));
  }, [players.data, team, pos, q]);

  const compareProfiles = useMemo(() => {
    const all = players.data?.players ?? [];
    return compare
      .map((id) => {
        const pl = all.find((p) => p.playerId === id);
        return pl ? statByName.get(normalizeName(pl.name)) : undefined;
      })
      .filter((p): p is PlayerStatProfile => !!p);
  }, [compare, players.data, statByName]);

  const toggleCompare = (id: string, name: string) => {
    setCompare((c) => {
      if (c.includes(id)) return c.filter((x) => x !== id);
      if (c.length >= 4) return c;
      // only players with a stat profile can join the radar
      if (!statByName.get(normalizeName(name))) return c;
      return [...c, id];
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-bone">Player Eval</h1>
        <span className="font-mono text-[11px] text-silver">
          {stats.data?.pulledAt
            ? `2025-26 snapshot · ${stats.data.qualifiedCount} qualified players league-wide · pulled ${stats.data.pulledAt.slice(0, 10)}`
            : "stats snapshot not pulled yet. Run etl/pull_stats.py"}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <label className="flex items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-wideish text-silver">team</span>
          <select
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            className="w-56 max-w-full rounded border border-graphite-line bg-graphite-panel px-2.5 py-1.5 text-sm text-bone"
          >
            <option value="ALL">All seeded teams</option>
            {(teams.data?.teams ?? []).map((t) => (
              <option key={t.team} value={t.team}>
                {t.team} · {t.teamName}
              </option>
            ))}
          </select>
        </label>
        <div role="group" aria-label="Position filter" className="flex gap-1">
          {POSITIONS.map((p) => (
            <button
              key={p}
              aria-pressed={pos === p}
              onClick={() => setPos(pos === p ? null : p)}
              className={`rounded border px-2 py-1.5 font-mono text-[11px] ${
                pos === p ? "border-royal-bright bg-royal text-bone" : "border-graphite-line text-silver hover:text-bone"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="search players…"
          aria-label="Search players"
          className="min-w-40 flex-1 rounded border border-graphite-line bg-graphite-panel px-3 py-1.5 text-sm text-bone placeholder:text-silver/50 sm:max-w-xs"
        />
      </div>

      {compareProfiles.length >= 2 && (
        <ComparePanel
          profiles={compareProfiles}
          onRemove={(pid) => {
            const pl = (players.data?.players ?? []).find(
              (p) => statByName.get(normalizeName(p.name))?.playerId === pid || p.playerId === pid,
            );
            setCompare((c) => c.filter((x) => x !== (pl?.playerId ?? pid)));
          }}
        />
      )}
      {compare.length === 1 && (
        <p className="font-mono text-[11px] text-silver">pick one more player to open the comparison radar (up to 4)</p>
      )}

      {players.loading || stats.loading || teams.loading ? (
        <div className="min-h-dvh">
          <p className="animate-pulse font-mono text-sm text-silver">loading players…</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((p) => (
            <PlayerCard
              key={`${p.team}-${p.playerId}`}
              player={p}
              profile={statByName.get(normalizeName(p.name)) ?? null}
              compareIndex={compare.indexOf(p.playerId)}
              onCompareToggle={() => toggleCompare(p.playerId, p.name)}
              compareDisabled={compare.length >= 4}
            />
          ))}
          {list.length === 0 && (
            <p className="col-span-full py-8 text-center font-mono text-sm text-silver">
              no players match those filters
            </p>
          )}
        </div>
      )}
    </div>
  );
}
