/**
 * Three pre-built proposals so a reviewer with 60 seconds sees the depth:
 * one legal (with a hard-cap flag), one apron-illegal, one Stepien-illegal.
 * Player ids reference the seeded rosters in /data; the verdicts are what the
 * engine returns for these exact rosters (checked against the live API).
 */
export interface Scenario {
  name: string;
  verdict: "legal" | "illegal";
  why: string;
  url: string;
}

export const SCENARIOS: readonly Scenario[] = [
  {
    name: "Monk for Vanderbilt + Hardy",
    verdict: "legal",
    why: "LAL takes back more than 100% of what it sends, which hard-caps the Lakers at the first apron.",
    url: "/trade?a=SAC&b=LAL&give=1628370&get=1629020.lal-hardy",
  },
  {
    name: "Monk for McBride",
    verdict: "illegal",
    why: "NYK would finish above the second apron, where a team can take back no more salary than it sends.",
    url: "/trade?a=SAC&b=NYK&give=1628370&get=1630540",
  },
  {
    name: "LaVine + 2027 and 2028 firsts for Dončić",
    verdict: "illegal",
    why: "Sending back-to-back firsts breaks the Stepien rule. Swap 2028 for 2029 and it stamps legal.",
    url: "/trade?a=SAC&b=LAL&give=203897&get=1629029&picksA=2027.2028",
  },
];
