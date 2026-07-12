"use client";

import type { RuleCheck, Verdict } from "@/engine/types";

const ORDER: Record<RuleCheck["status"], number> = { fail: 0, warning: 1, pass: 2, "n/a": 3 };

const GLYPH: Record<RuleCheck["status"], string> = {
  fail: "✕",
  warning: "▲",
  pass: "✓",
  "n/a": "·",
};

const TONE: Record<RuleCheck["status"], { text: string; border: string; word: string }> = {
  fail: { text: "text-illegal", border: "border-l-illegal", word: "FAIL" },
  warning: { text: "text-warn", border: "border-l-warn", word: "FLAG" },
  pass: { text: "text-legal", border: "border-l-legal/70", word: "PASS" },
  "n/a": { text: "text-silver/50", border: "border-l-graphite-line", word: "N/A" },
};

function LedgerRow({ check }: { check: RuleCheck }) {
  const tone = TONE[check.status];
  const openByDefault = check.status === "fail" || check.status === "warning";
  return (
    <details
      open={openByDefault}
      className={`group border-l-2 ${tone.border} ${check.status === "n/a" ? "opacity-60" : ""}`}
    >
      <summary className="flex cursor-pointer select-none items-baseline gap-2.5 px-3 py-2 hover:bg-graphite-panel/60 [&::-webkit-details-marker]:hidden">
        <span aria-hidden className={`w-4 shrink-0 text-center font-mono text-[12px] ${tone.text}`}>
          {GLYPH[check.status]}
        </span>
        <span className={`w-12 shrink-0 font-mono text-[10px] font-bold tracking-wider ${tone.text}`}>
          {tone.word}
        </span>
        <span className="w-10 shrink-0 font-mono text-[11px] text-silver">{check.team || "DEAL"}</span>
        <span className="hidden sm:inline w-40 shrink-0 font-mono text-[11px] text-silver/70">
          {check.id}
        </span>
        <span className="min-w-0 flex-1 text-[13px] leading-snug text-bone">{check.headline}</span>
        <span aria-hidden className="ml-1 shrink-0 font-mono text-[10px] text-silver/50 group-open:rotate-90 transition-transform">
          ▸
        </span>
      </summary>
      <p className="px-3 pb-2.5 pl-[4.75rem] font-mono text-[11.5px] leading-relaxed text-silver">
        <span className="sm:hidden block mb-1 text-silver/60">[{check.id}]</span>
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
    <section
      aria-label="Rule ledger"
      className="rounded-md border border-graphite-line bg-graphite-raised"
    >
      <header className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-graphite-line px-4 py-2.5">
        <h2 className="font-display text-base font-semibold uppercase tracking-wideish text-silver">
          Rule Ledger
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-wide text-silver/70">
          every check, itemized · failures pinned first
        </span>
        <span className="ml-auto flex gap-2 font-mono text-[10px]">
          {counts.fail > 0 && <span className="text-illegal">{counts.fail} fail</span>}
          {counts.warning > 0 && <span className="text-warn">{counts.warning} flag</span>}
          <span className="text-legal">{counts.pass} pass</span>
          <span className="text-silver/50">{counts["n/a"]} n/a</span>
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
