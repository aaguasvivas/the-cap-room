import "server-only";
import { computeCapSheet } from "@/engine/capsheet";
import type { Player, TeamCapSheet, TeamCode, TeamPicks } from "@/engine/types";
import {
  MetaSchema,
  PicksFileSchema,
  RosterFileSchema,
  StatsFileSchema,
  type Meta,
  type RosterFile,
  type StatsFile,
} from "./schemas";

// Static imports: the seeded league is a fixed, auditable set of files.
// Everything is Zod-validated at first access; a malformed file throws.
import SAC from "@/data/rosters/SAC.json";
import CLE from "@/data/rosters/CLE.json";
import OKC from "@/data/rosters/OKC.json";
import NYK from "@/data/rosters/NYK.json";
import GSW from "@/data/rosters/GSW.json";
import LAL from "@/data/rosters/LAL.json";
import BKN from "@/data/rosters/BKN.json";
import SAC_PICKS from "@/data/picks/SAC.json";
import META from "@/data/meta.json";
import STATS from "@/data/stats/players-2025-26.json";

const RAW_ROSTERS = [SAC, CLE, OKC, NYK, GSW, LAL, BKN];

let rostersCache: Map<TeamCode, RosterFile> | null = null;

function rosters(): Map<TeamCode, RosterFile> {
  if (!rostersCache) {
    rostersCache = new Map(
      RAW_ROSTERS.map((raw) => {
        const file = RosterFileSchema.parse(raw);
        return [file.team, file] as const;
      }),
    );
  }
  return rostersCache;
}

export function listTeams(): { team: TeamCode; teamName: string; asOf: string }[] {
  return [...rosters().values()].map((r) => ({
    team: r.team,
    teamName: r.teamName,
    asOf: r.asOf,
  }));
}

export function loadRoster(team: TeamCode): RosterFile | null {
  return rosters().get(team.toUpperCase()) ?? null;
}

export function loadCapSheet(team: TeamCode): TeamCapSheet | null {
  const file = loadRoster(team);
  if (!file) return null;
  return computeCapSheet(file.team, file.players as Player[]);
}

export function loadAllCapSheets(): Record<TeamCode, TeamCapSheet> {
  const out: Record<TeamCode, TeamCapSheet> = {};
  for (const file of rosters().values()) {
    out[file.team] = computeCapSheet(file.team, file.players as Player[]);
  }
  return out;
}

let picksCache: Record<TeamCode, TeamPicks> | null = null;

/** Only SAC's pick ledger is seeded in v1; other teams default to owning their firsts. */
export function loadPicks(): Record<TeamCode, TeamPicks> {
  if (!picksCache) {
    const sac = PicksFileSchema.parse(SAC_PICKS);
    picksCache = {
      [sac.team]: { team: sac.team, firstRound: sac.firstRound },
    };
  }
  return picksCache;
}

let metaCache: Meta | null = null;
export function loadMeta(): Meta {
  if (!metaCache) metaCache = MetaSchema.parse(META);
  return metaCache;
}

let statsCache: StatsFile | null = null;
export function loadStats(): StatsFile {
  if (!statsCache) statsCache = StatsFileSchema.parse(STATS);
  return statsCache;
}
