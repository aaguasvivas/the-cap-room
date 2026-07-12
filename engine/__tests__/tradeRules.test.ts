import { describe, expect, it } from "vitest";
import { maxIncomingBelowApron, validateTrade } from "../tradeRules";
import type { RuleCheck, Verdict } from "../types";
import { ctxFor, mkPlayer, padRoster, propose, sheetFor } from "./fixtures";

const failing = (v: Verdict): RuleCheck[] => v.checks.filter((c) => c.status === "fail");
const byId = (v: Verdict, team: string, id: string): RuleCheck | undefined =>
  v.checks.find((c) => c.team === team && c.id === id);

describe("R1 formula sanity checks (spec-mandated)", () => {
  it("allows $19,096,000 back for $10M out", () => {
    expect(maxIncomingBelowApron(10_000_000)).toBe(19_096_000);
  });
  it("allows $6,250,000 back for $3M out", () => {
    expect(maxIncomingBelowApron(3_000_000)).toBe(6_250_000);
  });
  it("allows $50,250,000 back for $40M out", () => {
    expect(maxIncomingBelowApron(40_000_000)).toBe(50_250_000);
  });
});

describe("below-apron trades (R1, R6)", () => {
  it("passes a 1-for-1 inside 125% + $250K with a clean ledger for the lighter side", () => {
    const sacOut = mkPlayer({ id: "sac-out", name: "Sac Wing", salary: 10_000_000 });
    const dalOut = mkPlayer({ id: "dal-out", name: "Dal Guard", salary: 9_800_000 });
    const sac = sheetFor("SAC", padRoster("SAC", [sacOut], 170_000_000));
    const dal = sheetFor("DAL", padRoster("DAL", [dalOut], 172_000_000));

    const v = validateTrade(propose({ team: "SAC", playerIds: ["sac-out"] }, { team: "DAL", playerIds: ["dal-out"] }), ctxFor([sac, dal]));

    expect(v.legal).toBe(true);
    expect(failing(v)).toEqual([]);
    // SAC takes back less than it sends: no hard cap for SAC…
    expect(v.checks.filter((c) => c.team === "SAC" && c.status === "warning")).toEqual([]);
    // …but DAL takes back more than 100%, which hard-caps DAL at the first apron.
    expect(byId(v, "DAL", "hardcap-apron1")?.status).toBe("warning");
  });

  it("passes a 2-for-1 using the expanded TPE, flagging first- AND second-apron hard caps", () => {
    const a = mkPlayer({ id: "sac-a", name: "Sac A", salary: 8_000_000 });
    const b = mkPlayer({ id: "sac-b", name: "Sac B", salary: 4_000_000 });
    const star = mkPlayer({ id: "dal-star", name: "Dal Star", salary: 20_000_000 });
    const sac = sheetFor("SAC", padRoster("SAC", [a, b], 170_000_000));
    const dal = sheetFor("DAL", padRoster("DAL", [star], 172_000_000));

    const v = validateTrade(propose({ team: "SAC", playerIds: ["sac-a", "sac-b"] }, { team: "DAL", playerIds: ["dal-star"] }), ctxFor([sac, dal]));

    expect(v.legal).toBe(true);
    // $12M out allows $21,096,000 in — the $20M star fits only via the expanded TPE.
    expect(byId(v, "SAC", "salary-matching")?.status).toBe("pass");
    expect(byId(v, "SAC", "hardcap-apron1")?.status).toBe("warning");
    // Aggregating Sac A + Sac B also hard-caps at the second apron.
    expect(byId(v, "SAC", "hardcap-apron2")?.status).toBe("warning");
    expect(byId(v, "SAC", "hardcap-apron2")?.detail).toContain("Sac A + Sac B");
  });

  it("does not call it aggregation when the return fits the largest single outgoing salary", () => {
    const big = mkPlayer({ id: "sac-big", name: "Sac Big", salary: 20_000_000 });
    const small = mkPlayer({ id: "sac-small", name: "Sac Small", salary: 5_000_000 });
    const ret = mkPlayer({ id: "dal-ret", name: "Dal Return", salary: 18_000_000 });
    // 175M keeps SAC over the cap after the trade (168M) so matching rules bind.
    const sac = sheetFor("SAC", padRoster("SAC", [big, small], 175_000_000));
    const dal = sheetFor("DAL", padRoster("DAL", [ret], 190_000_000));

    const v = validateTrade(propose({ team: "SAC", playerIds: ["sac-big", "sac-small"] }, { team: "DAL", playerIds: ["dal-ret"] }), ctxFor([sac, dal]));

    expect(v.legal).toBe(true);
    // $18M in ≤ maxIncomingBelowApron($20M) = $29,096,000 → no aggregation needed.
    expect(byId(v, "SAC", "aggregation")?.status).toBe("pass");
    expect(byId(v, "SAC", "aggregation")?.headline).toContain("not required");
    expect(byId(v, "SAC", "hardcap-apron2")?.status).toBe("pass");
  });

  it("absorbs salary into cap room without matching when the team finishes under the cap", () => {
    const filler = mkPlayer({ id: "bkn-out", name: "Bkn Filler", salary: 2_000_000 });
    const inc = mkPlayer({ id: "sac-inc", name: "Sac Salary", salary: 20_000_000 });
    const bkn = sheetFor("BKN", padRoster("BKN", [filler], 140_000_000));
    const sac = sheetFor("SAC", padRoster("SAC", [inc], 170_000_000));

    const v = validateTrade(propose({ team: "BKN", playerIds: ["bkn-out"] }, { team: "SAC", playerIds: ["sac-inc"] }), ctxFor([bkn, sac]));

    expect(v.legal).toBe(true);
    expect(byId(v, "BKN", "salary-matching")?.status).toBe("pass");
    expect(byId(v, "BKN", "salary-matching")?.detail).toContain("cap room");
    // Room absorption is not an expanded-TPE takeback: no hard cap for BKN.
    expect(byId(v, "BKN", "hardcap-apron1")?.status).toBe("pass");
  });
});

describe("apron matching regimes (R2, R3)", () => {
  it("caps a first-apron team at 100%: one dollar over outgoing fails", () => {
    const out = mkPlayer({ id: "nyk-out", name: "Nyk Out", salary: 10_000_000 });
    const back = mkPlayer({ id: "chi-back", name: "Chi Back", salary: 10_000_001 });
    const nyk = sheetFor("NYK", padRoster("NYK", [out], 213_000_000)); // finishes 213,000,001 — above apron 1
    const chi = sheetFor("CHI", padRoster("CHI", [back], 180_000_000));

    const v = validateTrade(propose({ team: "NYK", playerIds: ["nyk-out"] }, { team: "CHI", playerIds: ["chi-back"] }), ctxFor([nyk, chi]));

    expect(v.legal).toBe(false);
    const check = byId(v, "NYK", "salary-matching");
    expect(check?.status).toBe("fail");
    expect(check?.detail).toContain("100%");
    expect(check?.detail).toContain("first apron");
  });

  it("lets a first-apron team take back exactly 100%", () => {
    const out = mkPlayer({ id: "nyk-out", name: "Nyk Out", salary: 10_000_000 });
    const back = mkPlayer({ id: "chi-back", name: "Chi Back", salary: 10_000_000 });
    const nyk = sheetFor("NYK", padRoster("NYK", [out], 213_000_000));
    const chi = sheetFor("CHI", padRoster("CHI", [back], 180_000_000));

    const v = validateTrade(propose({ team: "NYK", playerIds: ["nyk-out"] }, { team: "CHI", playerIds: ["chi-back"] }), ctxFor([nyk, chi]));

    expect(byId(v, "NYK", "salary-matching")?.status).toBe("pass");
    expect(byId(v, "NYK", "hardcap-apron1")?.status).toBe("pass"); // 100% is not >100%
    expect(v.legal).toBe(true);
  });

  it("fails a second-apron team that takes back one dollar more than it sends", () => {
    const out = mkPlayer({ id: "bos-out", name: "Bos Out", salary: 30_000_000 });
    const back = mkPlayer({ id: "nyk-back", name: "Nyk Back", salary: 30_000_001 });
    const bos = sheetFor("BOS", padRoster("BOS", [out], 230_000_000));
    const nyk = sheetFor("NYK", padRoster("NYK", [back], 180_000_000));

    const v = validateTrade(propose({ team: "BOS", playerIds: ["bos-out"] }, { team: "NYK", playerIds: ["nyk-back"] }), ctxFor([bos, nyk]));

    expect(v.legal).toBe(false);
    expect(byId(v, "BOS", "salary-matching")?.status).toBe("fail");
    expect(byId(v, "BOS", "salary-matching")?.detail).toContain("second apron");
  });

  it("fails a second-apron team that aggregates two salaries even when the money matches", () => {
    const a = mkPlayer({ id: "bos-a", name: "Bos A", salary: 30_000_000 });
    const b = mkPlayer({ id: "bos-b", name: "Bos B", salary: 20_000_000 });
    const star = mkPlayer({ id: "nyk-star", name: "Nyk Star", salary: 45_000_000 });
    const bos = sheetFor("BOS", padRoster("BOS", [a, b], 230_000_000)); // finishes 225M — still above apron 2
    const nyk = sheetFor("NYK", padRoster("NYK", [star], 165_000_000));

    const v = validateTrade(propose({ team: "BOS", playerIds: ["bos-a", "bos-b"] }, { team: "NYK", playerIds: ["nyk-star"] }), ctxFor([bos, nyk]));

    expect(v.legal).toBe(false);
    // Money fits (45 in ≤ 50 out) — it is specifically the aggregation that's illegal.
    expect(byId(v, "BOS", "salary-matching")?.status).toBe("pass");
    expect(byId(v, "BOS", "apron2-aggregation")?.status).toBe("fail");
  });

  it("fails a second-apron team that sends cash", () => {
    const out = mkPlayer({ id: "bos-out", name: "Bos Out", salary: 30_000_000 });
    const back = mkPlayer({ id: "nyk-back", name: "Nyk Back", salary: 28_000_000 });
    const bos = sheetFor("BOS", padRoster("BOS", [out], 230_000_000)); // finishes 228M — above apron 2
    const nyk = sheetFor("NYK", padRoster("NYK", [back], 165_000_000));

    const v = validateTrade(
      propose({ team: "BOS", playerIds: ["bos-out"], cash: 1_000_000 }, { team: "NYK", playerIds: ["nyk-back"] }),
      ctxFor([bos, nyk]),
    );

    expect(v.legal).toBe(false);
    expect(byId(v, "BOS", "apron2-cash")?.status).toBe("fail");
  });
});

describe("roster bounds (R4)", () => {
  it("fails a trade that leaves a team with 16 standard contracts", () => {
    const out = mkPlayer({ id: "sac-out", name: "Sac Out", salary: 10_000_000 });
    const in1 = mkPlayer({ id: "dal-1", name: "Dal One", salary: 5_000_000 });
    const in2 = mkPlayer({ id: "dal-2", name: "Dal Two", salary: 4_000_000 });
    const sac = sheetFor("SAC", padRoster("SAC", [out], 170_000_000, 15));
    const dal = sheetFor("DAL", padRoster("DAL", [in1, in2], 172_000_000, 15));

    const v = validateTrade(propose({ team: "SAC", playerIds: ["sac-out"] }, { team: "DAL", playerIds: ["dal-1", "dal-2"] }), ctxFor([sac, dal]));

    expect(v.legal).toBe(false);
    expect(byId(v, "SAC", "roster-bounds")?.status).toBe("fail");
    expect(byId(v, "SAC", "roster-bounds")?.headline).toContain("16");
  });

  it("warns (not fails) when a team drops to 13 standard contracts", () => {
    const a = mkPlayer({ id: "sac-a", name: "Sac A", salary: 8_000_000 });
    const b = mkPlayer({ id: "sac-b", name: "Sac B", salary: 4_000_000 });
    const back = mkPlayer({ id: "dal-back", name: "Dal Back", salary: 11_000_000 });
    const sac = sheetFor("SAC", padRoster("SAC", [a, b], 170_000_000));
    const dal = sheetFor("DAL", padRoster("DAL", [back], 172_000_000));

    const v = validateTrade(propose({ team: "SAC", playerIds: ["sac-a", "sac-b"] }, { team: "DAL", playerIds: ["dal-back"] }), ctxFor([sac, dal]));

    expect(v.legal).toBe(true);
    expect(byId(v, "SAC", "roster-bounds")?.status).toBe("warning");
    expect(byId(v, "SAC", "roster-bounds")?.headline).toContain("13");
  });
});

describe("two-way contracts (R4)", () => {
  it("fails when only counting a two-way salary would make the matching work", () => {
    const std = mkPlayer({ id: "sac-std", name: "Sac Std", salary: 2_000_000 });
    const tw = mkPlayer({ id: "sac-tw", name: "Sac TwoWay", salary: 678_882, type: "two-way" });
    const back = mkPlayer({ id: "dal-back", name: "Dal Back", salary: 5_000_000 });
    const sacPlayers = [...padRoster("SAC", [std], 180_000_000), tw];
    const sac = sheetFor("SAC", sacPlayers);
    const dal = sheetFor("DAL", padRoster("DAL", [back], 172_000_000));

    const v = validateTrade(propose({ team: "SAC", playerIds: ["sac-std", "sac-tw"] }, { team: "DAL", playerIds: ["dal-back"] }), ctxFor([sac, dal]));

    expect(v.legal).toBe(false);
    expect(byId(v, "SAC", "salary-matching")?.status).toBe("fail");
    expect(byId(v, "SAC", "two-way-matching")?.status).toBe("fail");
    expect(byId(v, "SAC", "two-way-matching")?.detail).toContain("excluded");
  });
});

describe("cash rules (R5, R6)", () => {
  const setup = (cash: number) => {
    const out = mkPlayer({ id: "sac-out", name: "Sac Out", salary: 10_000_000 });
    const back = mkPlayer({ id: "dal-back", name: "Dal Back", salary: 9_000_000 });
    const sac = sheetFor("SAC", padRoster("SAC", [out], 170_000_000));
    const dal = sheetFor("DAL", padRoster("DAL", [back], 172_000_000));
    return validateTrade(
      propose({ team: "SAC", playerIds: ["sac-out"], cash }, { team: "DAL", playerIds: ["dal-back"] }),
      ctxFor([sac, dal]),
    );
  };

  it("fails cash one dollar beyond the $8,495,000 annual limit", () => {
    const v = setup(8_495_001);
    expect(v.legal).toBe(false);
    expect(byId(v, "SAC", "cash-limit")?.status).toBe("fail");
  });

  it("passes cash exactly at the limit, but flags the second-apron hard cap it triggers", () => {
    const v = setup(8_495_000);
    expect(v.legal).toBe(true);
    expect(byId(v, "SAC", "cash-limit")?.status).toBe("pass");
    expect(byId(v, "SAC", "hardcap-apron2")?.status).toBe("warning");
    expect(byId(v, "SAC", "hardcap-apron2")?.detail).toContain("cash");
  });

  it("counts cash already sent this league year against the limit", () => {
    const out = mkPlayer({ id: "sac-out", name: "Sac Out", salary: 10_000_000 });
    const back = mkPlayer({ id: "dal-back", name: "Dal Back", salary: 9_000_000 });
    const sac = sheetFor("SAC", padRoster("SAC", [out], 170_000_000));
    const dal = sheetFor("DAL", padRoster("DAL", [back], 172_000_000));
    const v = validateTrade(
      propose({ team: "SAC", playerIds: ["sac-out"], cash: 5_000_000 }, { team: "DAL", playerIds: ["dal-back"] }),
      ctxFor([sac, dal], undefined, { SAC: { sent: 4_000_000, received: 0 } }),
    );
    expect(v.legal).toBe(false);
    expect(byId(v, "SAC", "cash-limit")?.status).toBe("fail");
  });
});

describe("picks and the Stepien rule (R7)", () => {
  const rosters = () => {
    const out = mkPlayer({ id: "sac-out", name: "Sac Out", salary: 10_000_000 });
    const back = mkPlayer({ id: "dal-back", name: "Dal Back", salary: 9_000_000 });
    return {
      sac: sheetFor("SAC", padRoster("SAC", [out], 170_000_000)),
      dal: sheetFor("DAL", padRoster("DAL", [back], 172_000_000)),
    };
  };

  it("fails a pick trade that leaves SAC without firsts in consecutive future drafts", () => {
    const { sac, dal } = rosters();
    const picks = {
      SAC: { team: "SAC", firstRound: [{ year: 2029, status: "traded" as const, counterparty: "ATL" }] },
    };
    const v = validateTrade(
      propose({ team: "SAC", playerIds: ["sac-out"], pickIds: ["SAC-2028-1st"] }, { team: "DAL", playerIds: ["dal-back"] }),
      ctxFor([sac, dal], picks),
    );
    expect(v.legal).toBe(false);
    expect(byId(v, "SAC", "stepien")?.status).toBe("fail");
    expect(byId(v, "SAC", "stepien")?.headline).toContain("2028 & 2029");
  });

  it("passes the same structure when the intervening year is covered by a swap", () => {
    const { sac, dal } = rosters();
    const picks = {
      SAC: { team: "SAC", firstRound: [{ year: 2028, status: "swap" as const, counterparty: "BOS" }] },
    };
    const v = validateTrade(
      propose({ team: "SAC", playerIds: ["sac-out"], pickIds: ["SAC-2027-1st"] }, { team: "DAL", playerIds: ["dal-back"] }),
      ctxFor([sac, dal], picks),
    );
    expect(v.legal).toBe(true);
    expect(byId(v, "SAC", "stepien")?.status).toBe("pass");
  });

  it("refuses to trade a pick the team no longer owns", () => {
    const { sac, dal } = rosters();
    const picks = {
      SAC: { team: "SAC", firstRound: [{ year: 2028, status: "traded" as const, counterparty: "ATL" }] },
    };
    const v = validateTrade(
      propose({ team: "SAC", playerIds: ["sac-out"], pickIds: ["SAC-2028-1st"] }, { team: "DAL", playerIds: ["dal-back"] }),
      ctxFor([sac, dal], picks),
    );
    expect(v.legal).toBe(false);
    expect(byId(v, "SAC", "pick-integrity")?.status).toBe("fail");
  });
});

describe("player trade restrictions (R8)", () => {
  it("warns on a no-trade clause (consent required) without making the trade illegal", () => {
    const ntc = mkPlayer({ id: "sac-ntc", name: "Sac Vet", salary: 10_000_000, restrictions: ["no-trade"] });
    const back = mkPlayer({ id: "dal-back", name: "Dal Back", salary: 9_000_000 });
    const sac = sheetFor("SAC", padRoster("SAC", [ntc], 170_000_000));
    const dal = sheetFor("DAL", padRoster("DAL", [back], 172_000_000));
    const v = validateTrade(propose({ team: "SAC", playerIds: ["sac-ntc"] }, { team: "DAL", playerIds: ["dal-back"] }), ctxFor([sac, dal]));
    expect(v.legal).toBe(true);
    expect(byId(v, "SAC", "player-restrictions")?.status).toBe("warning");
    expect(byId(v, "SAC", "player-restrictions")?.detail).toContain("consent");
  });

  it("fails a recently-signed player and cites the trade-eligible date", () => {
    const fresh = mkPlayer({
      id: "sac-fresh",
      name: "Sac Signing",
      salary: 12_000_000,
      restrictions: ["recently-signed"],
      returnEligibleDate: "2026-12-15",
    });
    const back = mkPlayer({ id: "dal-back", name: "Dal Back", salary: 11_000_000 });
    const sac = sheetFor("SAC", padRoster("SAC", [fresh], 170_000_000));
    const dal = sheetFor("DAL", padRoster("DAL", [back], 172_000_000));
    const v = validateTrade(propose({ team: "SAC", playerIds: ["sac-fresh"] }, { team: "DAL", playerIds: ["dal-back"] }), ctxFor([sac, dal]));
    expect(v.legal).toBe(false);
    expect(byId(v, "SAC", "player-restrictions")?.status).toBe("fail");
    expect(byId(v, "SAC", "player-restrictions")?.detail).toContain("2026-12-15");
  });
});

describe("integrity and structure", () => {
  it("fails cleanly when a player id isn't on the stated roster", () => {
    const sac = sheetFor("SAC", padRoster("SAC", [], 170_000_000));
    const dal = sheetFor("DAL", padRoster("DAL", [mkPlayer({ id: "dal-x", salary: 5_000_000 })], 172_000_000));
    const v = validateTrade(propose({ team: "SAC", playerIds: ["ghost"] }, { team: "DAL", playerIds: ["dal-x"] }), ctxFor([sac, dal]));
    expect(v.legal).toBe(false);
    expect(v.checks.some((c) => c.id === "roster-integrity" && c.status === "fail")).toBe(true);
  });

  it("refuses to trade dead money", () => {
    const dead = mkPlayer({ id: "sac-dead", name: "Sac Waived", salary: 5_000_000, type: "dead" });
    const sacPlayers = [...padRoster("SAC", [], 170_000_000), dead];
    const sac = sheetFor("SAC", sacPlayers);
    const dal = sheetFor("DAL", padRoster("DAL", [mkPlayer({ id: "dal-x", salary: 5_000_000 })], 172_000_000));
    const v = validateTrade(propose({ team: "SAC", playerIds: ["sac-dead"] }, { team: "DAL", playerIds: ["dal-x"] }), ctxFor([sac, dal]));
    expect(v.legal).toBe(false);
    expect(v.checks.some((c) => c.id === "roster-integrity" && c.headline.includes("dead-money"))).toBe(true);
  });

  it("rejects a proposal where both sides are the same team", () => {
    const sac = sheetFor("SAC", padRoster("SAC", [mkPlayer({ id: "a", salary: 1 })], 170_000_000));
    const v = validateTrade(propose({ team: "SAC", playerIds: ["a"] }, { team: "SAC", playerIds: ["a"] }), ctxFor([sac]));
    expect(v.legal).toBe(false);
    expect(v.checks[0]?.id).toBe("structure");
    expect(v.checks[0]?.status).toBe("fail");
  });
});
