"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { PlayersResponse, TeamsResponse } from "@/lib/apiTypes";
import { foldForSearch, normalizeName } from "@/lib/names";
import type { PlayerStatProfile } from "@/lib/percentiles";
import { useApi } from "@/lib/hooks";
import { PageHeader } from "@/components/ui/bits";
import { ComparePanel } from "./ComparePanel";
import { PCTL_TIERS } from "./PercentileBars";
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

  // Dead money is a cap charge, not a player you can evaluate or trade for.
  const people = useMemo(() => (players.data?.players ?? []).filter((p) => p.contractType !== "dead"), [players.data]);

  // Teams whose rosters carry salary past 2026-27; derived from the data so it
  // corrects itself when ORL and PHI out-years are seeded.
  const outYearTeams = useMemo(
    () => new Set(people.filter((p) => p.salary["2027-28"] !== undefined || p.salary["2028-29"] !== undefined).map((p) => p.team)),
    [people],
  );

  const list = useMemo(() => {
    let l = people;
    if (team !== "ALL") l = l.filter((p) => p.team === team);
    if (pos) l = l.filter((p) => p.pos === pos);
    if (q.trim()) l = l.filter((p) => foldForSearch(p.name).includes(foldForSearch(q)));
    return [...l].sort((a, b) => (b.salary["2026-27"] ?? 0) - (a.salary["2026-27"] ?? 0));
  }, [people, team, pos, q]);

  const compareProfiles = useMemo(
    () =>
      compare
        .map((id) => {
          const pl = people.find((p) => p.playerId === id);
          return pl ? statByName.get(normalizeName(pl.name)) : undefined;
        })
        .filter((p): p is PlayerStatProfile => !!p),
    [compare, people, statByName],
  );

  const toggleCompare = (id: string) =>
    setCompare((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length >= 4 ? c : [...c, id]));

  const loading = players.loading || stats.loading || teams.loading;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Player Eval"
        note={
          stats.data?.pulledAt
            ? `2025-26 snapshot · ${stats.data.qualifiedCount} qualified players league-wide · pulled ${stats.data.pulledAt.slice(0, 10)}`
            : undefined
        }
      />

      <div className="flex flex-wrap items-center gap-2.5">
        <label className="flex items-center gap-2">
          <span className="eyebrow">team</span>
          <select
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            className="w-56 max-w-full rounded border border-graphite-line bg-graphite-panel px-2.5 py-1.5 text-sm font-medium text-bone hover:border-royal-soft"
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
              type="button"
              key={p}
              aria-pressed={pos === p}
              onClick={() => setPos(pos === p ? null : p)}
              className={`rounded border px-2 py-1.5 font-mono text-[11px] transition-colors ${
                pos === p ? "border-royal-bright bg-royal text-bone" : "border-graphite-line text-silver hover:border-royal-soft hover:text-bone"
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
          placeholder="Search players…"
          aria-label="Search players"
          className="min-w-40 flex-1 rounded border border-graphite-line bg-graphite-panel px-3 py-1.5 text-sm text-bone placeholder:text-dim sm:max-w-xs"
        />
        <p aria-hidden className="hidden items-center gap-3 font-mono text-[10px] text-dim xl:ml-auto xl:flex">
          {PCTL_TIERS.map((t) => (
            <span key={t.label} className="flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-4 rounded-full" style={{ background: t.bar }} />
              {t.label}
            </span>
          ))}
        </p>
      </div>

      {compareProfiles.length >= 2 && (
        <ComparePanel
          profiles={compareProfiles}
          onRemove={(statId) => {
            const pl = people.find((p) => statByName.get(normalizeName(p.name))?.playerId === statId);
            setCompare((c) => c.filter((x) => x !== (pl?.playerId ?? statId)));
          }}
        />
      )}
      {compare.length === 1 && (
        <p className="rounded border border-dashed border-royal-bright/50 px-3 py-2 font-mono text-[11px] text-silver">
          Pick one more player to open the comparison radar (up to four).
        </p>
      )}

      <section aria-labelledby="players-heading">
        <h2 id="players-heading" className="sr-only">
          Players
        </h2>
        {players.error || stats.error ? (
          <p role="alert" className="rounded border border-illegal/60 bg-illegal/10 px-4 py-3 text-sm text-bone">
            {players.error ?? stats.error}
          </p>
        ) : loading ? (
          <div className="min-h-dvh" aria-busy>
            <p className="animate-pulse font-mono text-sm text-silver">Loading players…</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {list.map((p) => (
              <PlayerCard
                key={`${p.team}-${p.playerId}`}
                player={p}
                profile={statByName.get(normalizeName(p.name)) ?? null}
                compareIndex={compare.indexOf(p.playerId)}
                onCompareToggle={() => toggleCompare(p.playerId)}
                compareFull={compare.length >= 4}
                outYearsSeeded={outYearTeams.has(p.team)}
              />
            ))}
            {list.length === 0 && (
              <p className="col-span-full py-8 text-center font-mono text-sm text-silver">No players match those filters.</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
