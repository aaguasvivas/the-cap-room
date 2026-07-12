import {
  BI_ANNUAL_EXC,
  CAP_LINES,
  FIRST_APRON,
  LEAGUE_YEAR,
  LUXURY_TAX,
  MIN_TEAM_SALARY,
  NON_TAXPAYER_MLE,
  ROOM_MLE,
  SALARY_CAP,
  SECOND_APRON,
  TAXPAYER_MLE,
} from "./constants";
import { usd } from "./format";
import type {
  ApronStatus,
  ExceptionInfo,
  LeagueYear,
  Player,
  TeamCapSheet,
  TeamCode,
} from "./types";

/** Two-way salaries do not count against team salary. Dead money does. */
export function countsTowardCap(p: Player): boolean {
  return p.contractType !== "two-way";
}

/** Standard roster spots: everything except dead money and two-ways. */
export function isStandardRosterSpot(p: Player): boolean {
  return p.contractType !== "dead" && p.contractType !== "two-way";
}

export function salaryFor(p: Player, year: LeagueYear): number {
  return p.salary[year] ?? 0;
}

/**
 * Classify a team total against the lines. Strict-greater semantics:
 * a team exactly AT a line has not crossed it. Exactly $209,015,000 is a
 * taxpayer; $209,015,001 is a first-apron team.
 */
export function classifyTotal(total: number): ApronStatus {
  if (total > SECOND_APRON) return "second-apron";
  if (total > FIRST_APRON) return "first-apron";
  if (total > LUXURY_TAX) return "taxpayer";
  if (total > SALARY_CAP) return "over-cap";
  return "under-cap";
}

export function statusLabel(status: ApronStatus): string {
  switch (status) {
    case "under-cap":
      return "Under the cap";
    case "over-cap":
      return "Over the cap, under the tax";
    case "taxpayer":
      return "Taxpayer";
    case "first-apron":
      return "Above the first apron";
    case "second-apron":
      return "Above the second apron";
  }
}

function buildExceptions(status: ApronStatus): ExceptionInfo[] {
  const roomTeam = status === "under-cap";
  const belowApron1 = status === "under-cap" || status === "over-cap" || status === "taxpayer";
  const belowApron2 = status !== "second-apron";

  return [
    {
      id: "room-mle",
      name: "Room MLE",
      amount: ROOM_MLE,
      available: roomTeam,
      reason: roomTeam
        ? "Available: team is operating under the cap (room teams get the Room MLE instead of the NT-MLE/BAE)."
        : "Unavailable: only teams that use cap room get the Room MLE.",
    },
    {
      id: "nt-mle",
      name: "Non-Taxpayer MLE",
      amount: NON_TAXPAYER_MLE,
      available: !roomTeam && belowApron1,
      reason: !roomTeam && belowApron1
        ? "Available while team salary stays at or below the first apron."
        : roomTeam
          ? "Unavailable: room teams renounce the NT-MLE when they use cap space."
          : `Unavailable: team salary is above the first apron (${usd(FIRST_APRON)}).`,
      hardCapNote: `Using the NT-MLE hard-caps the team at the first apron (${usd(FIRST_APRON)}) for the rest of ${LEAGUE_YEAR}.`,
    },
    {
      id: "bae",
      name: "Bi-Annual Exception",
      amount: BI_ANNUAL_EXC,
      available: !roomTeam && belowApron1,
      reason: !roomTeam && belowApron1
        ? "Available while team salary stays at or below the first apron (and not used last season; assumed unused in this snapshot)."
        : roomTeam
          ? "Unavailable: room teams renounce the BAE when they use cap space."
          : `Unavailable: team salary is above the first apron (${usd(FIRST_APRON)}).`,
      hardCapNote: `Using the BAE hard-caps the team at the first apron (${usd(FIRST_APRON)}) for the rest of ${LEAGUE_YEAR}.`,
    },
    {
      id: "tp-mle",
      name: "Taxpayer MLE",
      amount: TAXPAYER_MLE,
      available: !roomTeam && !belowApron1 && belowApron2,
      reason: !roomTeam && !belowApron1 && belowApron2
        ? "Available: team is above the first apron but at or below the second."
        : belowApron1
          ? "Not needed: a team at or below the first apron uses the larger NT-MLE instead."
          : `Unavailable: team salary is above the second apron (${usd(SECOND_APRON)}); minimum contracts only.`,
      hardCapNote: `Using the Taxpayer MLE hard-caps the team at the second apron (${usd(SECOND_APRON)}) for the rest of ${LEAGUE_YEAR}.`,
    },
  ];
}

const MULTI_YEARS: LeagueYear[] = ["2026-27", "2027-28", "2028-29"];

export function computeCapSheet(
  team: TeamCode,
  players: Player[],
  leagueYear: LeagueYear = LEAGUE_YEAR,
): TeamCapSheet {
  const counted = players.filter(countsTowardCap);
  const totalSalary = counted.reduce((sum, p) => sum + salaryFor(p, leagueYear), 0);
  const deadMoney = players
    .filter((p) => p.contractType === "dead")
    .reduce((sum, p) => sum + salaryFor(p, leagueYear), 0);
  const standardCount = players.filter(isStandardRosterSpot).length;
  const twoWayCount = players.filter((p) => p.contractType === "two-way").length;
  const status = classifyTotal(totalSalary);

  return {
    team,
    leagueYear,
    players,
    totalSalary,
    standardCount,
    twoWayCount,
    deadMoney,
    status,
    belowFloor: totalSalary < MIN_TEAM_SALARY,
    distances: CAP_LINES.map((line) => ({
      key: line.key,
      label: line.label,
      amount: line.amount,
      distance: line.amount - totalSalary,
    })),
    exceptions: buildExceptions(status),
    multiYear: MULTI_YEARS.map((year) => ({
      year,
      committed: counted.reduce((sum, p) => sum + salaryFor(p, year), 0),
      countedPlayers: counted.filter((p) => salaryFor(p, year) > 0).length,
    })),
  };
}
