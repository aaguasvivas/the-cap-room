"use client";

import type { RuleCheck, Verdict } from "@/engine/types";

const ORDER: Record<RuleCheck["status"], number> = { fail: 0, warning: 1, pass: 2, "n/a": 3 };

const GLYPH: Record<RuleCheck["status"], string> = {
  fail: "✕",
  warning: "▲",
  pass: "✓",
  "n/a": "·",
};

const TONE: Record<RuleCheck["status"], { text: string; border: string; word: string; headline: string }> = {
  fail: { text: "text-illegal", border: "border-l-illegal", word: "FAIL", headline: "text-bone" },
  warning: { text: "text-warn", border: "border-l-warn", word: "FLAG", headline: "text-bone" },
  pass: { text: "text-legal", border: "border-l-legal/70", word: "PASS", headline: "text-bone" },
  "n/a": { text: "text-dim", border: "border-l-graphite-line", word: "N/A", headline: "text-silver" },
};

function LedgerRow({ check }: { check: RuleCheck }) {
  const tone = TONE[check.status];
  const openByDefault = check.status === "fail" || check.status === "warning";
  return (
    <details
      open={openByDefault}
      className={`group border-l-2 ${tone.border} ${check.status === "fail" ? "bg-illegal/[0.04]" : ""}`}
    >
      <summary className="flex cursor-pointer select-none items-baseline gap-2.5 px-3 py-2 hover:bg-graphite-panel/60 [&::-webkit-details-marker]:hidden">
        <span aria-hidden className={`w-4 shrink-0 text-center font-mono text-[12px] ${tone.text}`}>
          {GLYPH[check.status]}
        </span>
        <span className={`w-10 shrink-0 font-mono text-[10px] font-bold tracking-wider ${tone.text}`}>{tone.word}</span>
        <span className="w-10 shrink-0 font-mono text-[11px] text-silver">{check.team || "DEAL"}</span>
        <span className="hidden w-40 shrink-0 font-mono text-[11px] text-dim sm:inline">{check.id}</span>
        <span className={`min-w-0 flex-1 text-[13px] leading-snug ${tone.headline}`}>{check.headline}</span>
        <span aria-hidden className="ml-1 shrink-0 font-mono text-[10px] text-dim transition-transform group-open:rotate-90">
          ▸
        </span>
      </summary>
      <p className="px-3 pb-3 pl-[2.375rem] font-mono sm:pl-[5.5rem] text-[11.5px] leading-relaxed text-silver">
        <span className="mb-1 block text-dim sm:hidden">[{check.id}]</span>
        {check.detail}
      </p>
    </details>
  );
}

export function RuleLedger({ verdict }: { verdict: Verdict }) {
  const sorted = [...verdict.checks].sort((a, b) => ORDER[a.status] - ORDER[b.status]);
  const counts = verdict.checks.reduce(
    (acc, c) => ((acc[c.status] += 1), acc),
    { fail: 0, warning: 0, pass: 0, "n/a": 0 } as Record<RuleCheck["status"], number>,
  );

  return (
    <section aria-label="Rule ledger" className="rounded-md border border-graphite-line bg-graphite-raised">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-graphite-line px-4 py-2.5">
        <h2 className="font-display text-base font-semibold uppercase tracking-wideish text-silver">Rule Ledger</h2>
        <span className="font-mono text-[10px] uppercase tracking-wide text-dim">
          {verdict.checks.length} checks · failures pinned first
        </span>
        <span className="ml-auto flex gap-2.5 font-mono text-[10px] uppercase tracking-wide">
          {counts.fail > 0 && <span className="text-illegal">{counts.fail} fail</span>}
          {counts.warning > 0 && <span className="text-warn">{counts.warning} flag</span>}
          <span className="text-legal">{counts.pass} pass</span>
          <span className="text-dim">{counts["n/a"]} n/a</span>
        </span>
      </header>
      <div className="divide-y divide-graphite-line/50">
        {sorted.map((c, i) => (
          <LedgerRow key={`${c.team}-${c.id}-${i}`} check={c} />
        ))}
      </div>
    </section>
  );
}
