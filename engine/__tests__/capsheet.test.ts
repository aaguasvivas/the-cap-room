import { describe, expect, it } from "vitest";
import { classifyTotal, computeCapSheet } from "../capsheet";
import {
  FIRST_APRON,
  LUXURY_TAX,
  MIN_TEAM_SALARY,
  SALARY_CAP,
  SECOND_APRON,
} from "../constants";
import { mkPlayer } from "./fixtures";

describe("cap sheet totals", () => {
  it("sums standard, minimum and dead money but excludes two-ways from team salary", () => {
    const sheet = computeCapSheet("SAC", [
      mkPlayer({ salary: 30_000_000 }),
      mkPlayer({ salary: 3_870_000, type: "min" }),
      mkPlayer({ salary: 5_000_000, type: "dead" }),
      mkPlayer({ salary: 678_882, type: "two-way" }),
    ]);
    expect(sheet.totalSalary).toBe(38_870_000);
    expect(sheet.deadMoney).toBe(5_000_000);
    expect(sheet.standardCount).toBe(2);
    expect(sheet.twoWayCount).toBe(1);
  });

  it("reports dollar distance to every line (positive = room below the line)", () => {
    const sheet = computeCapSheet("SAC", [mkPlayer({ salary: 180_000_000 })]);
    const by = Object.fromEntries(sheet.distances.map((d) => [d.key, d.distance]));
    expect(by["tax"]).toBe(LUXURY_TAX - 180_000_000);
    expect(by["apron1"]).toBe(FIRST_APRON - 180_000_000);
    expect(by["cap"]).toBe(SALARY_CAP - 180_000_000);
    expect(by["cap"]).toBeLessThan(0);
  });

  it("computes multi-year committed salary from seeded out-year figures only", () => {
    const sheet = computeCapSheet("SAC", [
      mkPlayer({ salary: 20_000_000, salary27: 21_000_000, salary28: 22_000_000 }),
      mkPlayer({ salary: 10_000_000, salary27: 10_500_000 }),
      mkPlayer({ salary: 678_882, type: "two-way" }),
    ]);
    const by = Object.fromEntries(sheet.multiYear.map((m) => [m.year, m.committed]));
    expect(by["2026-27"]).toBe(30_000_000);
    expect(by["2027-28"]).toBe(31_500_000);
    expect(by["2028-29"]).toBe(22_000_000);
  });
});

describe("apron classification at exact boundaries (a team AT a line has not crossed it)", () => {
  it("classifies exactly $209,015,000 as taxpayer and one dollar more as first-apron", () => {
    expect(classifyTotal(FIRST_APRON)).toBe("taxpayer");
    expect(classifyTotal(FIRST_APRON + 1)).toBe("first-apron");
  });

  it("classifies exactly at the second apron as first-apron and one dollar more as second-apron", () => {
    expect(classifyTotal(SECOND_APRON)).toBe("first-apron");
    expect(classifyTotal(SECOND_APRON + 1)).toBe("second-apron");
  });

  it("classifies exactly at the tax line as over-cap and one dollar more as taxpayer", () => {
    expect(classifyTotal(LUXURY_TAX)).toBe("over-cap");
    expect(classifyTotal(LUXURY_TAX + 1)).toBe("taxpayer");
  });

  it("classifies exactly at the cap as under-cap and one dollar more as over-cap", () => {
    expect(classifyTotal(SALARY_CAP)).toBe("under-cap");
    expect(classifyTotal(SALARY_CAP + 1)).toBe("over-cap");
  });

  it("flags a team below the salary floor", () => {
    expect(computeCapSheet("SAC", [mkPlayer({ salary: MIN_TEAM_SALARY - 1 })]).belowFloor).toBe(true);
    expect(computeCapSheet("SAC", [mkPlayer({ salary: MIN_TEAM_SALARY })]).belowFloor).toBe(false);
  });
});

describe("exception availability follows apron status", () => {
  const availableIds = (total: number) =>
    computeCapSheet("SAC", [mkPlayer({ salary: total })])
      .exceptions.filter((e) => e.available)
      .map((e) => e.id)
      .sort();

  it("gives a room team only the Room MLE", () => {
    expect(availableIds(150_000_000)).toEqual(["room-mle"]);
  });

  it("gives an over-cap, below-first-apron team the NT-MLE and BAE with first-apron hard-cap notes", () => {
    expect(availableIds(180_000_000)).toEqual(["bae", "nt-mle"]);
    const sheet = computeCapSheet("SAC", [mkPlayer({ salary: 180_000_000 })]);
    const nt = sheet.exceptions.find((e) => e.id === "nt-mle");
    expect(nt?.hardCapNote).toContain("first apron");
  });

  it("gives a first-apron team only the Taxpayer MLE, which hard-caps at the second apron", () => {
    expect(availableIds(215_000_000)).toEqual(["tp-mle"]);
    const sheet = computeCapSheet("SAC", [mkPlayer({ salary: 215_000_000 })]);
    expect(sheet.exceptions.find((e) => e.id === "tp-mle")?.hardCapNote).toContain("second apron");
  });

  it("gives a second-apron team no exceptions at all", () => {
    expect(availableIds(225_000_000)).toEqual([]);
  });
});
