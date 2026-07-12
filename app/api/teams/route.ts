import { NextResponse } from "next/server";
import { statusLabel } from "@/engine/capsheet";
import { loadAllCapSheets, loadMeta, loadRoster } from "@/lib/data/load";

/** GET /api/teams — every seeded team with its cap position. */
export async function GET() {
  const sheets = loadAllCapSheets();
  const meta = loadMeta();
  const teams = Object.values(sheets)
    .map((s) => ({
      team: s.team,
      teamName: loadRoster(s.team)?.teamName ?? s.team,
      totalSalary: s.totalSalary,
      status: s.status,
      statusLabel: statusLabel(s.status),
      standardCount: s.standardCount,
      twoWayCount: s.twoWayCount,
    }))
    .sort((a, b) => b.totalSalary - a.totalSalary);
  return NextResponse.json({ leagueYear: meta.leagueYear, seedDate: meta.seedDate, teams });
}
