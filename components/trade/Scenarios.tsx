"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Three pre-built proposals so a reviewer with 60 seconds sees the depth:
 * one legal (with hard-cap flag), one apron-illegal, one Stepien-illegal.
 * Player ids reference the seeded rosters in /data.
 */
const SCENARIOS = [
  {
    name: "Monk ⇄ Claxton",
    note: "legal: flags the first-apron hard cap SAC creates by taking back more than 100%",
    url: "/trade?a=SAC&b=BKN&give=1628370&get=1629651",
  },
  {
    name: "Hunter ⇄ Caruso + J. Williams",
    note: "illegal: OKC finishes above the second apron and cannot aggregate two salaries",
    url: "/trade?a=SAC&b=OKC&give=1629631&get=1627936.okc-jaylin-williams",
  },
  {
    name: "LaVine + 2027 + 2028 firsts ⇄ Dončić",
    note: "illegal: the pick package strips consecutive future firsts (Stepien rule)",
    url: "/trade?a=SAC&b=LAL&give=203897&get=1629029&picksA=2027.2028",
  },
] as const;

export function Scenarios() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  return (
    <div className="relative">
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((o) => !o)}
        className="rounded border border-royal-bright/70 bg-royal-faint px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-wide text-royal-soft hover:bg-royal hover:text-bone"
      >
        load scenario ▾
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" aria-hidden onClick={() => setOpen(false)} />
          <div role="menu" className="absolute right-0 z-20 mt-1.5 w-80 rounded-md border border-graphite-line bg-graphite-raised p-1.5 shadow-xl">
            {SCENARIOS.map((s) => (
              <button
                key={s.name}
                role="menuitem"
                className="block w-full rounded px-3 py-2 text-left hover:bg-graphite-panel"
                onClick={() => {
                  setOpen(false);
                  router.replace(s.url, { scroll: false });
                }}
              >
                <span className="block text-[13px] font-semibold text-bone">{s.name}</span>
                <span className="mt-0.5 block text-[11px] leading-snug text-silver">{s.note}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
