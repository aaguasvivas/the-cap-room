import { NextResponse } from "next/server";
import { statusLabel } from "@/engine/capsheet";
import { loadCapSheet, loadPicks, loadRoster } from "@/lib/data/load";

/** GET /api/teams/:code/capsheet — full engine-computed cap sheet for a team. */
export async function GET(_req: Request, { params }: { params: { code: string } }) {
  const code = params.code.toUpperCase();
  const sheet = loadCapSheet(code);
  const roster = loadRoster(code);
  if (!sheet || !roster) {
    return NextResponse.json(
      { error: `No seeded roster for "${code}". See /api/teams for the seeded league.` },
      { status: 404 },
    );
  }
  const picks = loadPicks()[code] ?? null;
  return NextResponse.json({
    ...sheet,
    teamName: roster.teamName,
    asOf: roster.asOf,
    statusLabel: statusLabel(sheet.status),
    picks,
  });
}
