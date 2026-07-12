"use client";

import type { Verdict } from "@/engine/types";

export function VerdictStamp({ verdict, validating }: { verdict: Verdict | null; validating: boolean }) {
  const warnings = verdict?.checks.filter((c) => c.status === "warning").length ?? 0;
  const fails = verdict?.checks.filter((c) => c.status === "fail").length ?? 0;

  return (
    <div aria-live="polite" className="flex min-h-[92px] items-center justify-center py-2">
      {!verdict ? (
        <span className="font-mono text-sm text-silver animate-pulse">running the rules…</span>
      ) : (
        <div
          key={`${verdict.legal}-${fails}-${warnings}`}
          style={{ animation: "stamp-in 420ms cubic-bezier(.2,.8,.3,1.2) both" }}
          className={`relative select-none rounded border-4 border-double px-6 py-3 text-center ${
            verdict.legal ? "border-legal text-legal" : "border-illegal text-illegal"
          } ${validating ? "opacity-60" : ""}`}
        >
          <div className="font-display text-3xl font-bold uppercase tracking-wideish sm:text-4xl">
            {verdict.legal ? "Legal" : "Illegal"}
          </div>
          <div className="mt-0.5 font-mono text-[10px] uppercase tracking-widest opacity-90">
            {verdict.legal
              ? warnings > 0
                ? `2026-27 CBA · ${warnings} hard-cap flag${warnings > 1 ? "s" : ""}`
                : "2026-27 CBA · clean"
              : `${fails} rule${fails > 1 ? "s" : ""} violated — ledger explains`}
          </div>
        </div>
      )}
    </div>
  );
}
