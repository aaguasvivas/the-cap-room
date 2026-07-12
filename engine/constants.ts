/**
 * League constants for the 2026-27 league year (official figures set July 1, 2026).
 *
 * Every value here must trace to a dated public source recorded in
 * docs/sources.md. If a value is unknown it must be surfaced as unknown,
 * never invented. The three minimum-salary figures marked "approx" below
 * are flagged for re-verification on seed day (see docs/sources.md).
 */

export const LEAGUE_YEAR = "2026-27" as const;

export const SALARY_CAP = 164_961_000;
export const MIN_TEAM_SALARY = 148_465_000; // 90% of cap
export const LUXURY_TAX = 200_428_000;
export const FIRST_APRON = 209_015_000;
export const SECOND_APRON = 221_686_000;

export const NON_TAXPAYER_MLE = 15_044_000;
export const TAXPAYER_MLE = 6_064_000;
export const ROOM_MLE = 9_366_000;
export const BI_ANNUAL_EXC = 5_477_000;

/** Middle-band adder in salary matching (the "expanded" traded player exception). */
export const EXPANDED_TPE_AMOUNT = 9_096_000;
export const TPE_BUFFER = 250_000;
/** Cash a team may send (and separately receive) in trades per league year. */
export const TRADE_CASH_LIMIT = 8_495_000;

export const MIN_ROOKIE = 1_350_000; // approx, verify on seed day
export const MIN_TWO_YR = 2_440_000; // approx, verify on seed day
export const MIN_VET = 3_870_000; // approx, verify on seed day
export const TWO_WAY_SALARY = 678_882;

export const ROSTER_MAX_STANDARD = 15;
export const ROSTER_MAX_TWO_WAY = 3;
export const ROSTER_MIN_SEASON = 14;

/** The five cap lines, in ascending order, the thermometer's skeleton. */
export const CAP_LINES = [
  { key: "floor", label: "Salary floor", amount: MIN_TEAM_SALARY },
  { key: "cap", label: "Salary cap", amount: SALARY_CAP },
  { key: "tax", label: "Luxury tax", amount: LUXURY_TAX },
  { key: "apron1", label: "First apron", amount: FIRST_APRON },
  { key: "apron2", label: "Second apron", amount: SECOND_APRON },
] as const;

export type CapLineKey = (typeof CAP_LINES)[number]["key"];
