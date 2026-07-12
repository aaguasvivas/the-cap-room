"use client";

import { useMemo, useState } from "react";
import { usd } from "@/engine/format";
import type { LeagueYear, Player } from "@/engine/types";

type SortKey = "name" | "pos" | "age" | "2026-27" | "2027-28" | "2028-29";
const YEARS: LeagueYear[] = ["2026-27", "2027-28", "2028-29"];

function optionMark(p: Player, year: string): string | null {
  const opt = p.options?.find((o) => o.year === year);
  if (!opt) return null;
  return opt.type === "player" ? "PO" : opt.type === "team" ? "TO" : "ETO";
}

function SalaryCell({ p, year }: { p: Player; year: LeagueYear }) {
  const v = p.salary[year];
  const mark = optionMark(p, year);
  return (
    <td className="whitespace-nowrap px-3 py-1.5 text-right font-mono text-[13px] tnum">
      {v === undefined ? (
        <span className="text-silver/40">·</span>
      ) : (
        <span className={p.guaranteed || year !== "2026-27" ? "text-bone" : "italic text-silver"}>
          {usd(v)}
          {mark && <sup className="ml-0.5 text-[9px] text-royal-soft">{mark}</sup>}
        </span>
      )}
    </td>
  );
}

function Rows({ players, label }: { players: Player[]; label: string }) {
  if (!players.length) return null;
  return (
    <>
      <tr>
        <td colSpan={7} className="border-t border-graphite-line bg-graphite-panel/60 px-3 py-1 font-mono text-[10px] uppercase tracking-wideish text-silver">
          {label}
        </td>
      </tr>
      {players.map((p) => (
        <tr key={p.playerId} className="border-t border-graphite-line/60 hover:bg-graphite-panel/50">
          <td className="px-3 py-1.5 text-[13px] font-medium text-bone">
            {p.name}
            {!p.guaranteed && p.contractType !== "two-way" && (
              <span className="ml-1.5 align-middle rounded-sm border border-silver/40 px-1 font-mono text-[9px] uppercase text-silver" title="2026-27 not fully guaranteed">
                NG
              </span>
            )}
            {p.tradeRestrictions?.includes("no-trade") && (
              <span className="ml-1.5 align-middle rounded-sm border border-warn/60 px-1 font-mono text-[9px] uppercase text-warn">NTC</span>
            )}
            {p.tradeRestrictions?.includes("recently-signed") && (
              <span
                className="ml-1.5 align-middle rounded-sm border border-warn/60 px-1 font-mono text-[9px] uppercase text-warn"
                title={`Recently signed. Trade-eligible ${p.returnEligibleDate ?? "date unknown"}`}
              >
                ⏳{p.returnEligibleDate ? ` ${p.returnEligibleDate}` : ""}
              </span>
            )}
          </td>
          <td className="px-3 py-1.5 text-center font-mono text-[12px] text-silver">{p.pos}</td>
          <td className="px-3 py-1.5 text-center font-mono text-[12px] tnum text-silver">{p.age}</td>
          {YEARS.map((y) => (
            <SalaryCell key={y} p={p} year={y} />
          ))}
          <td className="px-3 py-1.5 font-mono text-[11px] text-silver/80">{p.contractType}</td>
        </tr>
      ))}
    </>
  );
}

export function ContractTable({ players }: { players: Player[] }) {
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "2026-27", dir: -1 });

  const sorted = useMemo(() => {
    const cmp = (a: Player, b: Player): number => {
      let va: string | number, vb: string | number;
      if (sort.key === "name" || sort.key === "pos") {
        va = a[sort.key];
        vb = b[sort.key];
      } else if (sort.key === "age") {
        va = a.age;
        vb = b.age;
      } else {
        va = a.salary[sort.key] ?? -1;
        vb = b.salary[sort.key] ?? -1;
      }
      return (va < vb ? -1 : va > vb ? 1 : 0) * sort.dir;
    };
    return [...players].sort(cmp);
  }, [players, sort]);

  const standard = sorted.filter((p) => p.contractType !== "dead" && p.contractType !== "two-way");
  const dead = sorted.filter((p) => p.contractType === "dead");
  const twoWay = sorted.filter((p) => p.contractType === "two-way");

  const header = (key: SortKey, label: string, align = "text-left") => (
    <th scope="col" className={`${align} px-3 py-2`} aria-sort={sort.key === key ? (sort.dir === 1 ? "ascending" : "descending") : undefined}>
      <button
        className="font-mono text-[11px] uppercase tracking-wideish text-silver hover:text-bone"
        onClick={() => setSort((s) => ({ key, dir: s.key === key ? ((-s.dir) as 1 | -1) : key === "name" || key === "pos" ? 1 : -1 }))}
      >
        {label}
        {sort.key === key && <span aria-hidden className="ml-1">{sort.dir === 1 ? "↑" : "↓"}</span>}
      </button>
    </th>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse">
        <caption className="sr-only">Contract table: three years of salary per player</caption>
        <thead>
          <tr className="border-b border-graphite-line">
            {header("name", "Player")}
            {header("pos", "Pos", "text-center")}
            {header("age", "Age", "text-center")}
            {header("2026-27", "2026-27", "text-right")}
            {header("2027-28", "2027-28", "text-right")}
            {header("2028-29", "2028-29", "text-right")}
            <th scope="col" className="px-3 py-2 text-left font-mono text-[11px] uppercase tracking-wideish text-silver">Type</th>
          </tr>
        </thead>
        <tbody>
          <Rows players={standard} label={`Standard contracts (${standard.length})`} />
          <Rows players={dead} label={`Dead money (${dead.length})`} />
          <Rows players={twoWay} label={`Two-way (${twoWay.length}), excluded from team salary`} />
        </tbody>
      </table>
      <p className="mt-2 font-mono text-[10px] text-silver/70">
        PO player option · TO team option · NG not fully guaranteed · ⏳ trade-restricted until date shown · italics = non-guaranteed
      </p>
    </div>
  );
}
