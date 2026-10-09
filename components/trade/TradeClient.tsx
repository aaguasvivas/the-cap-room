"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { salaryFor, countsTowardCap } from "@/engine/capsheet";
import type { Player, Verdict } from "@/engine/types";
import { useCapsheet, usePlayers, useTeams } from "@/lib/hooks";
import {
  isEvaluable,
  parseTradeUrl,
  serializeTradeUrl,
  toProposal,
  type TradeUrlState,
} from "@/lib/tradeUrl";
import { Card, PageHeader } from "@/components/ui/bits";
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

  // Debounced validation against the app's own REST API. Each response is
  // stored with the proposal it answers, so "validating" is derived: the last
  // verdict stays on screen (dimmed) until the current proposal's arrives.
  const evaluable = isEvaluable(state);
  const proposalJson = JSON.stringify(toProposal(state));
  const [answer, setAnswer] = useState<{ key: string; verdict: Verdict | null; error: string | null } | null>(null);

  useEffect(() => {
    if (!evaluable) return;
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      fetch("/api/trade/validate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: proposalJson,
        signal: ctrl.signal,
      })
        .then(async (r) => {
          const body = await r.json().catch(() => null);
          if (!r.ok) throw new Error(body?.issues?.join("; ") ?? body?.error ?? `HTTP ${r.status}`);
          return body as Verdict;
        })
        .then((v) => setAnswer({ key: proposalJson, verdict: v, error: null }))
        .catch((e: Error) => {
          if (e.name !== "AbortError") setAnswer({ key: proposalJson, verdict: null, error: e.message });
        });
    }, 220);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [proposalJson, evaluable]);

  const validating = evaluable && answer?.key !== proposalJson;
  const verdict = evaluable ? (answer?.verdict ?? null) : null;
  const validateError = evaluable && answer?.key === proposalJson ? answer.error : null;

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
      <PageHeader title="Trade Machine" note="two-team trades · 2026-27 CBA">
        <Scenarios />
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            navigator.clipboard?.writeText(window.location.origin + shareUrl).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1600);
            });
          }}
        >
          <span aria-live="polite">{copied ? "✓ Link copied" : "Copy trade link"}</span>
        </button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TeamPanel
          sideLabel="Side A sends"
          idPrefix="a"
          teams={teams.data?.teams ?? []}
          team={state.a}
          exclude={state.b}
          roster={rosterA.data?.players ?? []}
          rosterError={rosterA.error}
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
          rosterError={rosterB.error}
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
        <div className="rounded-md border border-dashed border-graphite-line px-4 py-8 text-center">
          <p className="font-display text-xl font-semibold uppercase tracking-wide text-bone">No deal on the table yet</p>
          <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-silver">
            Add at least one player, pick or cash to each side. The verdict and the full rule ledger appear the
            moment both sides send something.
          </p>
          <div className="mt-4 flex justify-center">
            <Scenarios />
          </div>
        </div>
      ) : (
        <>
          {validateError ? (
            <p role="alert" className="rounded border border-illegal/60 bg-illegal/10 px-4 py-3 font-mono text-[12px] text-bone">
              The validator rejected this proposal: {validateError}
            </p>
          ) : (
            <VerdictStamp verdict={verdict} validating={validating} />
          )}
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
                          <p className="mt-1 font-mono text-[10px] tnum text-dim">
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
