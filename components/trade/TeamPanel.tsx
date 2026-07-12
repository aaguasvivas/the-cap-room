"use client";

import { usd, usdM } from "@/engine/format";
import { salaryFor } from "@/engine/capsheet";
import type { Player, TeamPicks } from "@/engine/types";
import type { TeamSummary } from "@/lib/apiTypes";
import { Card } from "@/components/ui/bits";
import { TeamSelect } from "@/components/ui/TeamSelect";
import { TRADE_CASH_LIMIT } from "@/engine/constants";

function PlayerRow({
  p,
  selected,
  onToggle,
}: {
  p: Player;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <li>
      <button
        onClick={onToggle}
        aria-pressed={selected}
        className={`flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left transition-colors ${
          selected
            ? "bg-royal text-bone"
            : "hover:bg-graphite-panel text-bone/90"
        }`}
      >
        <span aria-hidden className={`w-4 text-center font-mono text-[11px] ${selected ? "text-bone" : "text-silver/60"}`}>
          {selected ? "✕" : "+"}
        </span>
        <span className="min-w-0 flex-1 truncate text-[13px] font-medium">
          {p.name}
          {p.contractType === "two-way" && (
            <span className="ml-1.5 rounded-sm border border-silver/40 px-1 font-mono text-[9px] uppercase text-silver">2W</span>
          )}
          {p.tradeRestrictions?.includes("recently-signed") && (
            <span className="ml-1.5 rounded-sm border border-warn/60 px-1 font-mono text-[9px] text-warn" title={`Trade-eligible ${p.returnEligibleDate ?? "— date unknown"}`}>
              ⏳{p.returnEligibleDate ?? ""}
            </span>
          )}
          {p.tradeRestrictions?.includes("no-trade") && (
            <span className="ml-1.5 rounded-sm border border-warn/60 px-1 font-mono text-[9px] uppercase text-warn">NTC</span>
          )}
        </span>
        <span className={`font-mono text-[11px] ${selected ? "text-bone/90" : "text-silver"}`}>{p.pos}</span>
        <span className="w-24 text-right font-mono text-[12px] tnum">{usd(salaryFor(p, "2026-27"))}</span>
      </button>
    </li>
  );
}

export function TeamPanel({
  sideLabel,
  idPrefix,
  teams,
  team,
  exclude,
  roster,
  selected,
  cash,
  picks,
  pickYears,
  onTeam,
  onToggle,
  onCash,
  onTogglePick,
}: {
  sideLabel: string;
  idPrefix: string;
  teams: TeamSummary[];
  team: string;
  exclude: string;
  roster: Player[];
  selected: string[];
  cash: number;
  picks: TeamPicks | null;
  pickYears: number[];
  onTeam: (t: string) => void;
  onToggle: (id: string) => void;
  onCash: (v: number) => void;
  onTogglePick: (year: number) => void;
}) {
  const outgoing = roster.filter((p) => selected.includes(p.playerId));
  const outSalary = outgoing
    .filter((p) => p.contractType !== "two-way" && p.contractType !== "dead")
    .reduce((s, p) => s + salaryFor(p, "2026-27"), 0);
  const tradeable = roster.filter((p) => p.contractType !== "dead");

  return (
    <Card
      title={sideLabel}
      action={
        teams.length ? (
          <TeamSelect id={`${idPrefix}-team`} label="" teams={teams} value={team} onChange={onTeam} exclude={exclude} />
        ) : undefined
      }
    >
      <div className="space-y-3">
        <div className="flex items-baseline justify-between rounded bg-graphite-panel px-3 py-2">
          <span className="font-mono text-[11px] uppercase tracking-wideish text-silver">
            outgoing salary
          </span>
          <span className="font-display text-2xl font-semibold tnum text-bone">{usdM(outSalary)}</span>
        </div>

        <ul className="max-h-72 space-y-0.5 overflow-y-auto pr-1" aria-label={`${team} roster — click to add to the deal`}>
          {tradeable.length === 0 && (
            <li className="px-2 py-3 font-mono text-[12px] text-silver animate-pulse">loading roster…</li>
          )}
          {tradeable.map((p) => (
            <PlayerRow key={p.playerId} p={p} selected={selected.includes(p.playerId)} onToggle={() => onToggle(p.playerId)} />
          ))}
        </ul>

        <div className="border-t border-graphite-line pt-3">
          <label htmlFor={`${idPrefix}-cash`} className="flex items-center justify-between gap-3">
            <span className="font-mono text-[11px] uppercase tracking-wideish text-silver">cash out</span>
            <span className="font-mono text-[12px] tnum text-bone">{usd(cash)}</span>
          </label>
          <input
            id={`${idPrefix}-cash`}
            type="range"
            min={0}
            max={12_000_000}
            step={50_000}
            value={cash}
            onChange={(e) => onCash(Number(e.target.value))}
            className="mt-1.5 w-full accent-[#8253C2]"
            aria-describedby={`${idPrefix}-cash-note`}
          />
          <p id={`${idPrefix}-cash-note`} className="mt-0.5 font-mono text-[10px] text-silver/70">
            annual limit {usd(TRADE_CASH_LIMIT)} — slide past it and watch the ledger
          </p>
        </div>

        <div className="border-t border-graphite-line pt-3">
          <span className="font-mono text-[11px] uppercase tracking-wideish text-silver">first-round picks</span>
          {picks ? (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {picks.firstRound.map((pk) => {
                const inDeal = pickYears.includes(pk.year);
                if (pk.status === "traded") {
                  return (
                    <span key={pk.year} className="rounded-sm border border-graphite-line px-2 py-1 font-mono text-[11px] text-silver/40 line-through" title={`Already owed to ${pk.counterparty ?? "another team"}`}>
                      {pk.year}
                    </span>
                  );
                }
                if (pk.status === "swap") {
                  return (
                    <span key={pk.year} className="rounded-sm border border-graphite-line border-dashed px-2 py-1 font-mono text-[11px] text-silver/60" title={pk.note ?? `Swap rights held by ${pk.counterparty}`}>
                      {pk.year} ⇄ {pk.counterparty}
                    </span>
                  );
                }
                return (
                  <button
                    key={pk.year}
                    aria-pressed={inDeal}
                    onClick={() => onTogglePick(pk.year)}
                    className={`rounded-sm border px-2 py-1 font-mono text-[11px] transition-colors ${
                      inDeal
                        ? "border-royal-bright bg-royal text-bone"
                        : "border-graphite-line text-silver hover:border-royal-soft hover:text-bone"
                    }`}
                  >
                    {pk.year} 1st
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="mt-1 font-mono text-[10px] text-silver/60">
              pick ledger seeded for SAC only in v1 — other teams trade players and cash here
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
