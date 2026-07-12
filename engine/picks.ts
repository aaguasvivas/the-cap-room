import type { FirstRoundPick, TeamCode, TeamPicks } from "./types";

/**
 * Stepien rule: a team may not leave itself without a first-round pick in
 * consecutive future drafts. "Without" means traded away outright; a pick
 * that is merely swap-encumbered still counts as having a first that year.
 *
 * Teams own their future firsts by default; the picks file records only the
 * exceptions plus any explicitly-listed owned picks. The horizon checked is
 * the next seven drafts (the farthest a team may trade ahead).
 */

export const STEPIEN_HORIZON_YEARS = 7;
/** First draft after the 2026-27 league year begins. */
export const FIRST_FUTURE_DRAFT = 2027;

export function pickId(team: TeamCode, year: number): string {
  return `${team}-${year}-1st`;
}

export function parsePickId(id: string): { team: TeamCode; year: number } | null {
  const m = /^([A-Z]{2,4})-(\d{4})-1st$/.exec(id);
  if (!m || !m[1] || !m[2]) return null;
  return { team: m[1], year: Number(m[2]) };
}

export interface StepienResult {
  ok: boolean;
  /** Every consecutive pair of future drafts with no first in either. */
  gaps: Array<[number, number]>;
  /** Draft years where the team has a first (owned or swap-encumbered) post-trade. */
  coveredYears: number[];
  missingYears: number[];
}

/**
 * Evaluate Stepien compliance for one team after a proposed trade.
 *
 * @param picks         the team's picks file (may be undefined → all firsts owned)
 * @param sentYears     draft years of own firsts sent out in this trade
 * @param receivedYears draft years of firsts received in this trade (any origin;
 *                      an incoming first covers that draft year)
 */
export function checkStepien(
  picks: TeamPicks | undefined,
  sentYears: number[],
  receivedYears: number[],
): StepienResult {
  const byYear = new Map<number, FirstRoundPick>();
  for (const p of picks?.firstRound ?? []) byYear.set(p.year, p);

  const horizon: number[] = [];
  for (let y = FIRST_FUTURE_DRAFT; y < FIRST_FUTURE_DRAFT + STEPIEN_HORIZON_YEARS; y++) {
    horizon.push(y);
  }

  const covered = new Set<number>();
  for (const year of horizon) {
    const record = byYear.get(year);
    // Default: a team owns its own first. "traded" is the only status that
    // removes coverage; "swap" still counts as having a pick that year.
    let has = record ? record.status !== "traded" : true;
    if (sentYears.includes(year)) has = false;
    if (receivedYears.includes(year)) has = true;
    if (has) covered.add(year);
  }

  const gaps: Array<[number, number]> = [];
  for (let i = 0; i < horizon.length - 1; i++) {
    const a = horizon[i]!;
    const b = horizon[i + 1]!;
    if (!covered.has(a) && !covered.has(b)) gaps.push([a, b]);
  }

  return {
    ok: gaps.length === 0,
    gaps,
    coveredYears: horizon.filter((y) => covered.has(y)),
    missingYears: horizon.filter((y) => !covered.has(y)),
  };
}

/** Can this team actually send this pick? (It must own it, un-traded.) */
export function ownsPick(picks: TeamPicks | undefined, year: number): boolean {
  const record = picks?.firstRound.find((p) => p.year === year);
  if (!record) return true; // default ownership
  return record.status !== "traded";
}
