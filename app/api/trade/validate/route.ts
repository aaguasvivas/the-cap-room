import { NextRequest, NextResponse } from "next/server";
import { validateTrade } from "@/engine/tradeRules";
import type { TradeProposal } from "@/engine/types";
import { loadAllCapSheets, loadPicks } from "@/lib/data/load";
import { TradeProposalSchema } from "@/lib/data/schemas";

/**
 * POST /api/trade/validate — body is a TradeProposal, response is the
 * engine's Verdict: legal flag + the full itemized rule ledger.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body must be JSON." }, { status: 400 });
  }

  const parsed = TradeProposalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid trade proposal.",
        issues: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
      },
      { status: 400 },
    );
  }

  const verdict = validateTrade(parsed.data as TradeProposal, {
    capSheets: loadAllCapSheets(),
    picks: loadPicks(),
  });
  return NextResponse.json(verdict);
}
