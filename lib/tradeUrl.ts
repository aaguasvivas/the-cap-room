import type { TradeProposal } from "@/engine/types";

/**
 * The whole proposal lives in the URL: /trade?a=SAC&b=LAL&give=..&get=..
 * so any trade is shareable as a link and the back button walks history.
 */
export interface TradeUrlState {
  a: string;
  b: string;
  give: string[]; // player ids leaving team A
  get: string[]; // player ids leaving team B
  cashA: number;
  cashB: number;
  picksA: number[]; // draft years of team A firsts included
  picksB: number[];
}

export const EMPTY_STATE: TradeUrlState = {
  a: "SAC",
  b: "LAL",
  give: [],
  get: [],
  cashA: 0,
  cashB: 0,
  picksA: [],
  picksB: [],
};

const list = (v: string | null): string[] => (v ? v.split(".").filter(Boolean) : []);
const years = (v: string | null): number[] =>
  list(v)
    .map(Number)
    .filter((n) => Number.isInteger(n) && n >= 2027 && n <= 2033);
const money = (v: string | null): number => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.min(Math.round(n), 50_000_000) : 0;
};

export function parseTradeUrl(params: URLSearchParams): TradeUrlState {
  return {
    a: (params.get("a") ?? EMPTY_STATE.a).toUpperCase(),
    b: (params.get("b") ?? EMPTY_STATE.b).toUpperCase(),
    give: list(params.get("give")),
    get: list(params.get("get")),
    cashA: money(params.get("cashA")),
    cashB: money(params.get("cashB")),
    picksA: years(params.get("picksA")),
    picksB: years(params.get("picksB")),
  };
}

export function serializeTradeUrl(s: TradeUrlState): string {
  const p = new URLSearchParams();
  p.set("a", s.a);
  p.set("b", s.b);
  if (s.give.length) p.set("give", s.give.join("."));
  if (s.get.length) p.set("get", s.get.join("."));
  if (s.cashA > 0) p.set("cashA", String(s.cashA));
  if (s.cashB > 0) p.set("cashB", String(s.cashB));
  if (s.picksA.length) p.set("picksA", s.picksA.join("."));
  if (s.picksB.length) p.set("picksB", s.picksB.join("."));
  return `/trade?${p.toString()}`;
}

export function toProposal(s: TradeUrlState): TradeProposal {
  return {
    leagueYear: "2026-27",
    sides: [
      {
        team: s.a,
        playerIds: s.give,
        ...(s.cashA > 0 ? { cash: s.cashA } : {}),
        ...(s.picksA.length ? { pickIds: s.picksA.map((y) => `${s.a}-${y}-1st`) } : {}),
      },
      {
        team: s.b,
        playerIds: s.get,
        ...(s.cashB > 0 ? { cash: s.cashB } : {}),
        ...(s.picksB.length ? { pickIds: s.picksB.map((y) => `${s.b}-${y}-1st`) } : {}),
      },
    ],
  };
}

/** Both sides send something → worth validating. */
export function isEvaluable(s: TradeUrlState): boolean {
  const sends = (players: string[], cash: number, picks: number[]) =>
    players.length > 0 || cash > 0 || picks.length > 0;
  return sends(s.give, s.cashA, s.picksA) && sends(s.get, s.cashB, s.picksB);
}
