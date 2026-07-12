"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Verdict } from "@/engine/types";
import { salaryFor, countsTowardCap } from "@/engine/capsheet";
import type { Player } from "@/engine/types";
import { useCapsheet, usePlayers, useTeams } from "@/lib/hooks";
import {
  isEvaluable,
  parseTradeUrl,
  serializeTradeUrl,
  toProposal,
  type TradeUrlState,
} from "@/lib/tradeUrl";
import { Card } from "@/components/ui/bits";
import { Thermometer } from "@/components/viz/Thermometer";
import { usd, usdM } from "@/engine/format";
import { RuleLedger } from "./RuleLedger";
import { Scenarios } from "./Scenarios";
import { TeamPanel } from "./TeamPanel";
import { VerdictStamp } from "./VerdictStamp";

export function TradeClient() {
  const router = useRouter();
  const params = useSearchParams();
  const state = useMemo(() => parseTradeUrl(new URLSearchParams(params.toString())), [params]);

  const teams = useTeams();
  const rosterA = usePlayers(state.a);
  const rosterB = usePlayers(state.b);
  const sheetA = useCapsheet(state.a);
  const sheetB = useCapsheet(state.b);

  const update = useCallback(
    (patch: Partial<TradeUrlState>) => {
      const next = { ...state, ...patch };
      // Changing a team resets that side's assets.
      if (patch.a && patch.a !== state.a) Object.assign(next, { give: [], cashA: 0, picksA: [] });
      if (patch.b && patch.b !== state.b) Object.assign(next, { get: [], cashB: 0, picksB: [] });
      router.replace(serializeTradeUrl(next), { scroll: false });
    },
    [router, state],
  );

  // Debounced validation against the app's own REST API.
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [validating, setValidating] = useState(false);
  const evaluable = isEvaluable(state);
  const proposalJson = JSON.stringify(toProposal(state));
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!evaluable) {
      setVerdict(null);
      return;
    }
    setValidating(true);
    const t = setTimeout(() => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      fetch("/api/trade/validate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: proposalJson,
        signal: ctrl.signal,
      })
        .then((r) => r.json())
        .then((v: Verdict) => {
          setVerdict(v);
          setValidating(false);
        })
        .catch((e) => {
          if (e.name !== "AbortError") setValidating(false);
        });
    }, 220);
    return () => clearTimeout(t);
  }, [proposalJson, evaluable]);

  // Post-trade totals for the mini thermometers (same counting rules as the engine).
  const post = useMemo(() => {
    if (!sheetA.data || !sheetB.data || !rosterA.data || !rosterB.data) return null;
    const sum = (players: Player[], ids: string[]) =>
      players
        .filter((p) => ids.includes(p.playerId) && countsTowardCap(p))
        .reduce((s, p) => s + salaryFor(p, "2026-27"), 0);
    const outA = sum(rosterA.data.players, state.give);
    const outB = sum(rosterB.data.players, state.get);
    return {
      a: { pre: sheetA.data.totalSalary, post: sheetA.data.totalSalary - outA + outB, out: outA, in: outB },
      b: { pre: sheetB.data.totalSalary, post: sheetB.data.totalSalary - outB + outA, out: outB, in: outA },
    };
  }, [sheetA.data, sheetB.data, rosterA.data, rosterB.data, state.give, state.get]);

  const shareUrl = serializeTradeUrl(state);
  const [copied, setCopied] = useState(false);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-bone">
          Trade Machine
        </h1>
        <span className="font-mono text-[11px] text-silver">two-team trades · 2026-27 CBA</span>
        <div className="ml-auto flex min-w-0 flex-wrap items-center justify-end gap-2">
          <Scenarios />
          <button
            className="rounded border border-graphite-line bg-graphite-panel px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-wide text-silver hover:border-royal-soft hover:text-bone"
            onClick={() => {
              navigator.clipboard?.writeText(window.location.origin + shareUrl).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1600);
              });
            }}
          >
            {copied ? "✓ copied" : "copy trade link"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TeamPanel
          sideLabel="Side A sends"
          idPrefix="a"
          teams={teams.data?.teams ?? []}
          team={state.a}
          exclude={state.b}
          roster={rosterA.data?.players ?? []}
          selected={state.give}
          cash={state.cashA}
          picks={sheetA.data?.picks ?? null}
          pickYears={state.picksA}
          onTeam={(t) => update({ a: t })}
          onToggle={(id) =>
            update({ give: state.give.includes(id) ? state.give.filter((x) => x !== id) : [...state.give, id] })
          }
          onCash={(v) => update({ cashA: v })}
          onTogglePick={(y) =>
            update({ picksA: state.picksA.includes(y) ? state.picksA.filter((x) => x !== y) : [...state.picksA, y].sort() })
          }
        />
        <TeamPanel
          sideLabel="Side B sends"
          idPrefix="b"
          teams={teams.data?.teams ?? []}
          team={state.b}
          exclude={state.a}
          roster={rosterB.data?.players ?? []}
          selected={state.get}
          cash={state.cashB}
          picks={sheetB.data?.picks ?? null}
          pickYears={state.picksB}
          onTeam={(t) => update({ b: t })}
          onToggle={(id) =>
            update({ get: state.get.includes(id) ? state.get.filter((x) => x !== id) : [...state.get, id] })
          }
          onCash={(v) => update({ cashB: v })}
          onTogglePick={(y) =>
            update({ picksB: state.picksB.includes(y) ? state.picksB.filter((x) => x !== y) : [...state.picksB, y].sort() })
          }
        />
      </div>

      {!evaluable ? (
        <Card>
          <p className="py-6 text-center font-mono text-sm text-silver">
            Add at least one asset to each side. The full rule ledger renders the moment a deal exists.
          </p>
        </Card>
      ) : (
        <>
          <VerdictStamp verdict={verdict} validating={validating} />
          {verdict && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <RuleLedger verdict={verdict} />
              </div>
              <div className="space-y-4">
                {post && sheetA.data && sheetB.data && (
                  <Card title="Post-trade cap position">
                    <div className="space-y-4">
                      {[
                        { code: state.a, d: post.a, name: sheetA.data.teamName },
                        { code: state.b, d: post.b, name: sheetB.data.teamName },
                      ].map(({ code, d, name }) => (
                        <div key={code}>
                          <div className="mb-1 flex items-baseline justify-between">
                            <span className="font-display text-sm font-semibold uppercase tracking-wide text-bone">
                              {name}
                            </span>
                            <span className="font-mono text-[11px] tnum text-silver">
                              {usdM(d.pre)} → <span className="text-bone">{usdM(d.post)}</span>
                            </span>
                          </div>
                          <Thermometer total={d.post} preTotal={d.pre} compact animate={false} />
                          <p className="mt-1 font-mono text-[10px] text-silver/80">
                            out {usd(d.out)} · in {usd(d.in)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
