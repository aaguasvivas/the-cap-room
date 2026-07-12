import { describe, expect, it } from "vitest";
import { checkStepien, ownsPick } from "../picks";
import type { TeamPicks } from "../types";

const picksWith = (firstRound: TeamPicks["firstRound"]): TeamPicks => ({
  team: "SAC",
  firstRound,
});

describe("Stepien rule", () => {
  it("passes when a team with all its firsts trades one pick", () => {
    const r = checkStepien(undefined, [2028], []);
    expect(r.ok).toBe(true);
    expect(r.missingYears).toEqual([2028]);
  });

  it("fails when a trade leaves no firsts in consecutive future drafts", () => {
    // 2029 already traded away; sending 2028 leaves 2028+2029 both empty.
    const r = checkStepien(picksWith([{ year: 2029, status: "traded", counterparty: "ATL" }]), [2028], []);
    expect(r.ok).toBe(false);
    expect(r.gaps).toEqual([[2028, 2029]]);
  });

  it("passes when the gap year is only swap-encumbered, a swap still counts as a pick", () => {
    // 2028 swap-encumbered, sending 2027: 2027 gone, but 2028 counts.
    const r = checkStepien(picksWith([{ year: 2028, status: "swap", counterparty: "BOS" }]), [2027], []);
    expect(r.ok).toBe(true);
    expect(r.coveredYears).toContain(2028);
  });

  it("counts an incoming first toward coverage", () => {
    // 2027 already traded; sending 2028 but receiving a different 2028 first back.
    const r = checkStepien(picksWith([{ year: 2027, status: "traded", counterparty: "ATL" }]), [2028], [2028]);
    expect(r.ok).toBe(true);
  });

  it("knows which picks a team still owns", () => {
    const picks = picksWith([{ year: 2027, status: "traded", counterparty: "ATL" }]);
    expect(ownsPick(picks, 2027)).toBe(false);
    expect(ownsPick(picks, 2030)).toBe(true); // default ownership
    expect(ownsPick(undefined, 2028)).toBe(true);
  });
});
