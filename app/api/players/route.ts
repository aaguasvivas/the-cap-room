import { NextRequest, NextResponse } from "next/server";
import { listTeams, loadRoster } from "@/lib/data/load";
import { normalizeName } from "@/lib/names";

/** GET /api/players?team=SAC&q=mur: search seeded players (accent-insensitive: "doncic" finds Dončić). */
export async function GET(req: NextRequest) {
  const team = req.nextUrl.searchParams.get("team")?.toUpperCase();
  const raw = req.nextUrl.searchParams.get("q")?.trim();
  const q = raw ? normalizeName(raw) : "";

  const codes = team ? [team] : listTeams().map((t) => t.team);
  const players = codes.flatMap((code) => {
    const roster = loadRoster(code);
    if (!roster) return [];
    return roster.players
      .filter((p) => !q || normalizeName(p.name).includes(q))
      .map((p) => ({ ...p, team: roster.team, teamName: roster.teamName }));
  });

  if (team && !loadRoster(team)) {
    return NextResponse.json({ error: `No seeded roster for "${team}".` }, { status: 404 });
  }
  return NextResponse.json({ count: players.length, players });
}
