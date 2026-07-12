import { computeCapSheet } from "../capsheet";
import type {
  ContractType,
  Player,
  TeamCapSheet,
  TeamCode,
  TeamPicks,
  TradeContext,
  TradeProposal,
  TradeSide,
} from "../types";

let seq = 0;

export function mkPlayer(o: {
  id?: string;
  name?: string;
  salary: number;
  salary27?: number;
  salary28?: number;
  type?: ContractType;
  restrictions?: Player["tradeRestrictions"];
  returnEligibleDate?: string;
}): Player {
  seq += 1;
  const id = o.id ?? `p${seq}`;
  return {
    playerId: id,
    name: o.name ?? `Player ${id}`,
    pos: "SF",
    age: 27,
    salary: {
      "2026-27": o.salary,
      ...(o.salary27 !== undefined ? { "2027-28": o.salary27 } : {}),
      ...(o.salary28 !== undefined ? { "2028-29": o.salary28 } : {}),
    },
    contractType: o.type ?? "standard",
    ...(o.restrictions ? { tradeRestrictions: o.restrictions } : {}),
    ...(o.returnEligibleDate ? { returnEligibleDate: o.returnEligibleDate } : {}),
    guaranteed: true,
  };
}

/**
 * Build a roster of `count` standard contracts totalling exactly `total`,
 * with `featured` players first and identical fillers making up the rest.
 */
export function padRoster(team: TeamCode, featured: Player[], total: number, count = 14): Player[] {
  const featuredSum = featured.reduce((s, p) => s + (p.salary["2026-27"] ?? 0), 0);
  const fillers = count - featured.length;
  if (fillers < 0) throw new Error("more featured players than roster spots");
  const players = [...featured];
  if (fillers > 0) {
    const remaining = total - featuredSum;
    const each = Math.floor(remaining / fillers);
    const remainder = remaining - each * fillers;
    for (let i = 0; i < fillers; i++) {
      players.push(
        mkPlayer({
          id: `${team}-fill-${i}`,
          name: `${team} Filler ${i + 1}`,
          salary: each + (i === 0 ? remainder : 0),
        }),
      );
    }
  }
  return players;
}

export function sheetFor(team: TeamCode, players: Player[]): TeamCapSheet {
  return computeCapSheet(team, players);
}

export function ctxFor(
  sheets: TeamCapSheet[],
  picks?: Record<TeamCode, TeamPicks>,
  cashLedger?: TradeContext["cashLedger"],
): TradeContext {
  const capSheets: Record<TeamCode, TeamCapSheet> = {};
  for (const s of sheets) capSheets[s.team] = s;
  return {
    capSheets,
    ...(picks ? { picks } : {}),
    ...(cashLedger ? { cashLedger } : {}),
  };
}

export function propose(
  aSide: Partial<TradeSide> & { team: TeamCode },
  bSide: Partial<TradeSide> & { team: TeamCode },
): TradeProposal {
  return {
    leagueYear: "2026-27",
    sides: [
      { playerIds: [], ...aSide },
      { playerIds: [], ...bSide },
    ],
  };
}
