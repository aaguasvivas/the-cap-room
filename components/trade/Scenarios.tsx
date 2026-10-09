"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SCENARIOS } from "@/lib/scenarios";

/** Disclosure menu of the pre-built proposals (see lib/scenarios.ts). */
export function Scenarios() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const root = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((o) => !o)}
        className="btn btn-accent"
      >
        Load scenario <span aria-hidden>▾</span>
      </button>
      {open && (
        <ul
          id={listId}
          className="absolute right-0 z-20 mt-1.5 w-[min(22rem,calc(100vw-2rem))] rounded-md border border-graphite-line bg-graphite-raised p-1.5 shadow-xl shadow-black/50"
        >
          {SCENARIOS.map((s) => (
            <li key={s.name}>
              <button
                type="button"
                className="block w-full rounded px-3 py-2 text-left hover:bg-graphite-panel focus-visible:bg-graphite-panel"
                onClick={() => {
                  setOpen(false);
                  router.replace(s.url, { scroll: false });
                }}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`font-mono text-[9px] font-bold uppercase tracking-wider ${
                      s.verdict === "legal" ? "text-legal" : "text-illegal"
                    }`}
                  >
                    {s.verdict}
                  </span>
                  <span className="text-[13px] font-semibold text-bone">{s.name}</span>
                </span>
                <span className="mt-0.5 block text-[11px] leading-snug text-silver">{s.why}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
