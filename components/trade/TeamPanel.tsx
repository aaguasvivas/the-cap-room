"use client";

import { usd, usdM } from "@/engine/format";
import { salaryFor } from "@/engine/capsheet";
import type { Player, TeamPicks } from "@/engine/types";
import type { TeamSummary } from "@/lib/apiTypes";
import { Card, Flag } from "@/components/ui/bits";
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
        type="button"
        onClick={onToggle}
        aria-pressed={selected}
        className={`flex w-full items-center gap-2 rounded-sm px-2.5 py-1.5 text-left transition-colors ${
          selected ? "bg-royal text-bone" : "text-bone/90 hover:bg-graphite-panel"
        }`}
      >
        <span aria-hidden className={`w-4 text-center font-mono text-[11px] ${selected ? "text-bone" : "text-dim"}`}>
          {selected ? "✕" : "+"}
        </span>
        <span className="min-w-0 flex-1 truncate text-[13px] font-medium">
          {p.name}
          {p.contractType === "two-way" && <Flag title="Two-way contract">2W</Flag>}
          {p.tradeRestrictions?.includes("recently-signed") && (
            <Flag tone="warn" title={`Recently signed. Trade-eligible ${p.returnEligibleDate ?? "date unknown"}`}>
              ⏳{p.returnEligibleDate ?? ""}
            </Flag>
          )}
          {p.tradeRestrictions?.includes("no-trade") && (
            <Flag tone="warn" title="No-trade clause">
              NTC
            </Flag>
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
  rosterError,
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
  rosterError: string | null;
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
        <div className="flex items-baseline justify-between rounded-sm bg-graphite-panel px-3 py-2">
          <span className="eyebrow">
            outgoing salary{outgoing.length > 0 && <span className="text-dim"> · {outgoing.length} player{outgoing.length > 1 ? "s" : ""}</span>}
          </span>
          <span className="font-display text-2xl font-semibold tnum text-bone">{usdM(outSalary)}</span>
        </div>

        {/* Fixed height so the arriving roster never shifts the layout below */}
        <ul className="fade-bottom h-72 space-y-0.5 overflow-y-auto pb-6 pr-1" aria-label={`${team} roster, select players to add to the deal`}>
          {rosterError ? (
            <li role="alert" className="px-2 py-3 font-mono text-[12px] text-illegal">
              {rosterError}
            </li>
          ) : (
            tradeable.length === 0 && <li className="animate-pulse px-2 py-3 font-mono text-[12px] text-silver">Loading roster…</li>
          )}
          {tradeable.map((p) => (
            <PlayerRow key={p.playerId} p={p} selected={selected.includes(p.playerId)} onToggle={() => onToggle(p.playerId)} />
          ))}
        </ul>

        <div className="border-t border-graphite-line pt-3">
          <label htmlFor={`${idPrefix}-cash`} className="flex items-center justify-between gap-3">
            <span className="eyebrow">cash out</span>
            <span className={`font-mono text-[12px] tnum ${cash > TRADE_CASH_LIMIT ? "text-illegal" : "text-bone"}`}>{usd(cash)}</span>
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
          <p id={`${idPrefix}-cash-note`} className="mt-0.5 font-mono text-[10px] text-dim">
            Annual limit {usd(TRADE_CASH_LIMIT)}. Slide past it and watch the ledger.
          </p>
        </div>

        <div className="min-h-[76px] border-t border-graphite-line pt-3">
          <span className="eyebrow">first-round picks</span>
          {picks ? (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {picks.firstRound.map((pk) => {
                const inDeal = pickYears.includes(pk.year);
                if (pk.status === "traded") {
                  return (
                    <span
                      key={pk.year}
                      className="rounded-xs border border-graphite-line px-2 py-1 font-mono text-[11px] text-dim line-through"
                      title={`Already owed to ${pk.counterparty ?? "another team"}`}
                    >
                      {pk.year}
                    </span>
                  );
                }
                if (pk.status === "swap") {
                  return (
                    <span
                      key={pk.year}
                      className="rounded-xs border border-dashed border-graphite-line px-2 py-1 font-mono text-[11px] text-dim"
                      title={pk.note ?? `Swap rights held by ${pk.counterparty}`}
                    >
                      {pk.year} ⇄ {pk.counterparty}
                    </span>
                  );
                }
                return (
                  <button
                    type="button"
                    key={pk.year}
                    aria-pressed={inDeal}
                    onClick={() => onTogglePick(pk.year)}
                    title={pk.protections}
                    className={`rounded-xs border px-2 py-1 font-mono text-[11px] transition-colors ${
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
            <p className="mt-1 font-mono text-[10px] text-dim">
              Pick ledger is seeded for SAC only in v1. Other teams trade players and cash here.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
