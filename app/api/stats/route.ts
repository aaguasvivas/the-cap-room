import { NextRequest, NextResponse } from "next/server";
import { listTeams, loadRoster, loadStats } from "@/lib/data/load";
import { normalizeName } from "@/lib/names";
import { buildProfiles } from "@/lib/percentiles";

/**
 * GET /api/stats: the committed 2025-26 snapshot with league percentiles
 * precomputed. Percentiles are always computed against ALL qualified players
 * league-wide; the response body is trimmed to seeded-roster players unless
 * ?all=1 is passed (the full league is ~6x the payload).
 */
export async function GET(req: NextRequest) {
  const file = loadStats();
  const { qualifiedCount, profiles } = buildProfiles(file.players);

  const all = req.nextUrl.searchParams.get("all") === "1";
  let body = profiles;
  if (!all) {
    const seeded = new Set<string>();
    for (const { team } of listTeams()) {
      for (const p of loadRoster(team)?.players ?? []) seeded.add(normalizeName(p.name));
    }
    body = profiles.filter((p) => seeded.has(normalizeName(p.name)));
  }

  return NextResponse.json({
    season: file.season,
    pulledAt: file.pulledAt,
    source: file.source,
    qualifiedCount,
    profiles: body,
  });
}
