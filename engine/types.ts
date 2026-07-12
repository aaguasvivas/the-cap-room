/**
 * Core domain types. This module (and everything in /engine) is pure
 * TypeScript: no React, no Next.js, no I/O. The engine can be read and
 * audited on its own.
 */

export type LeagueYear = "2026-27" | "2027-28" | "2028-29";
export type TeamCode = string;
export type Position = "PG" | "SG" | "SF" | "PF" | "C";

export type ContractType = "standard" | "two-way" | "rookie-scale" | "min" | "dead";

export type TradeRestriction = "no-trade" | "recently-signed" | "cannot-aggregate";

export interface ContractOption {
  year: string;
  type: "player" | "team" | "ETO";
}

export interface Player {
  /** nba.com person id where known; otherwise a stable slug. */
  playerId: string;
  name: string;
  pos: Position;
  age: number;
  /** Cap hit per league year. Missing year = no money owed that year. */
  salary: { "2026-27": number; "2027-28"?: number; "2028-29"?: number };
  contractType: ContractType;
  options?: ContractOption[];
  tradeRestrictions?: TradeRestriction[];
  /** For "recently-signed": the date the player becomes trade-eligible, if known. */
  returnEligibleDate?: string;
  guaranteed: boolean;
}

// ---------------------------------------------------------------------------
// Cap sheet
// ---------------------------------------------------------------------------

/**
 * Where a team's total salary sits relative to the five lines.
 * Boundary semantics are strict-greater: a team exactly AT a line is not
 * above it (e.g. exactly $209,015,000 is NOT a first-apron team).
 */
export type ApronStatus =
  | "under-cap"
  | "over-cap" // over the cap, at or under the tax line (non-taxpayer)
  | "taxpayer" // over the tax line, at or under the first apron
  | "first-apron" // over the first apron, at or under the second
  | "second-apron"; // over the second apron

export interface CapLineDistance {
  key: "floor" | "cap" | "tax" | "apron1" | "apron2";
  label: string;
  amount: number;
  /** amount - totalSalary; positive = room below the line. */
  distance: number;
}

export type ExceptionId = "room-mle" | "nt-mle" | "tp-mle" | "bae";

export interface ExceptionInfo {
  id: ExceptionId;
  name: string;
  amount: number;
  available: boolean;
  /** Why it is / isn't available, in plain English. */
  reason: string;
  /** What using it triggers (hard-cap preview), when available. */
  hardCapNote?: string;
}

export interface TeamCapSheet {
  team: TeamCode;
  leagueYear: LeagueYear;
  players: Player[];
  /** Cap total for the league year: standard + rookie-scale + min + dead. Two-ways excluded. */
  totalSalary: number;
  /** Standard roster spots used (excludes dead money and two-ways). */
  standardCount: number;
  twoWayCount: number;
  deadMoney: number;
  status: ApronStatus;
  belowFloor: boolean;
  distances: CapLineDistance[];
  exceptions: ExceptionInfo[];
  /** Committed salary per future league year (counting players only, incl. dead). */
  multiYear: { year: LeagueYear; committed: number; countedPlayers: number }[];
}

// ---------------------------------------------------------------------------
// Picks
// ---------------------------------------------------------------------------

/**
 * First-round pick ownership. Teams own their own future firsts by default;
 * the picks file records the exceptions (traded away, swap-encumbered).
 * A swap-encumbered pick still counts as "having a first" for Stepien purposes.
 */
export type PickStatus = "owned" | "traded" | "swap";

export interface FirstRoundPick {
  year: number;
  status: PickStatus;
  /** For "traded": the team the pick is owed to. For "swap": the counterparty. */
  counterparty?: TeamCode;
  protections?: string;
  note?: string;
}

export interface TeamPicks {
  team: TeamCode;
  firstRound: FirstRoundPick[];
}

// ---------------------------------------------------------------------------
// Trade proposal + verdict
// ---------------------------------------------------------------------------

export interface TradeSide {
  team: TeamCode;
  /** Players leaving this team. */
  playerIds: string[];
  /** Cash this team sends, in dollars. */
  cash?: number;
  /** First-round picks this team sends, as "TEAM-YYYY-1st" ids. */
  pickIds?: string[];
}

export interface TradeProposal {
  leagueYear: LeagueYear;
  sides: [TradeSide, TradeSide];
}

export type CheckStatus = "pass" | "fail" | "warning" | "n/a";

export interface RuleCheck {
  /** Stable machine id, e.g. "salary-matching", "apron2-aggregation". */
  id: string;
  team: TeamCode;
  status: CheckStatus;
  /** One line with the numbers, e.g. "Salary matching: OK ($18.2M in vs $22.4M cap)". */
  headline: string;
  /** Plain-English rule explanation with the specific figures. */
  detail: string;
}

export interface Verdict {
  legal: boolean;
  /** EVERY rule evaluated, pass or fail — the full ledger. */
  checks: RuleCheck[];
}

/** Everything validateTrade needs to know about the league state. */
export interface TradeContext {
  capSheets: Record<TeamCode, TeamCapSheet>;
  picks?: Record<TeamCode, TeamPicks>;
  /** Cash already sent/received in trades this league year, per team. */
  cashLedger?: Record<TeamCode, { sent: number; received: number }>;
}
