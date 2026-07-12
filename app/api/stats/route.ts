import { NextResponse } from "next/server";
import { loadStats } from "@/lib/data/load";
import { buildProfiles } from "@/lib/percentiles";

/**
 * GET /api/stats — the committed 2025-26 snapshot with league percentiles
 * precomputed (vs all qualified players, not just seeded teams).
 */
export async function GET() {
  const file = loadStats();
  const { qualifiedCount, profiles } = buildProfiles(file.players);
  return NextResponse.json({
    season: file.season,
    pulledAt: file.pulledAt,
    source: file.source,
    qualifiedCount,
    profiles,
  });
}
