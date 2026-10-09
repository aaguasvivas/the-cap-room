"use client";

import type { Verdict } from "@/engine/types";

export function VerdictStamp({ verdict, validating }: { verdict: Verdict | null; validating: boolean }) {
  const warnings = verdict?.checks.filter((c) => c.status === "warning").length ?? 0;
  const fails = verdict?.checks.filter((c) => c.status === "fail").length ?? 0;

  return (
    <div aria-live="polite" aria-busy={validating} className="flex min-h-[96px] items-center justify-center overflow-x-clip py-2">
      {!verdict ? (
        <span className="animate-pulse font-mono text-sm text-silver">Running the rules…</span>
      ) : (
        <div
          key={`${verdict.legal}-${fails}-${warnings}`}
          style={{ animation: "stamp-in 420ms cubic-bezier(.2,.8,.3,1.2) both" }}
          className={`relative max-w-full select-none rounded border-4 border-double px-5 py-3 text-center transition-opacity sm:px-7 ${
            verdict.legal
              ? "border-legal text-legal shadow-[0_0_40px_-12px_rgba(63,166,106,0.55)]"
              : "border-illegal text-illegal shadow-[0_0_40px_-12px_rgba(239,91,91,0.55)]"
          } ${validating ? "opacity-60" : ""}`}
        >
          <div className="font-display text-4xl font-bold uppercase tracking-wideish sm:text-5xl">
            {verdict.legal ? "Legal" : "Illegal"}
          </div>
          <div className="mt-0.5 font-mono text-[10px] uppercase tracking-widest">
            {verdict.legal
              ? warnings > 0
                ? `2026-27 CBA · ${warnings} flag${warnings > 1 ? "s" : ""} in the ledger`
                : "2026-27 CBA · clean"
              : `${fails} rule${fails > 1 ? "s" : ""} violated · the ledger explains`}
          </div>
        </div>
      )}
    </div>
  );
}
