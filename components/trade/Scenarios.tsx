"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SCENARIOS } from "@/lib/scenarios";

/**
 * Disclosure menu of the pre-built proposals (see lib/scenarios.ts).
 * `align` picks how the menu hangs off its trigger: "end" (right-aligned, for
 * a trigger at the right of a toolbar) or "center" (for a centred trigger).
 * Below sm the menu is as wide as the screen allows, so it starts at the
 * trigger's left edge instead and never runs off-screen.
 */
export function Scenarios({ align = "end" }: { align?: "end" | "center" }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      // Escaping from inside the menu would otherwise drop focus to <body>.
      const inside = root.current?.contains(document.activeElement);
      setOpen(false);
      if (inside) trigger.current?.focus();
    };
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
        ref={trigger}
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
          className={`absolute z-20 mt-1.5 w-[min(22rem,calc(100vw-2rem))] rounded-md ${
            align === "center" ? "left-1/2 -translate-x-1/2" : "left-0 sm:left-auto sm:right-0"
          } border border-graphite-line bg-graphite-raised p-1.5 shadow-xl shadow-black/50`}
        >
          {SCENARIOS.map((s) => (
            <li key={s.name}>
              <button
                type="button"
                className="block w-full rounded-sm px-3 py-2 text-left hover:bg-graphite-panel focus-visible:bg-graphite-panel"
                onClick={() => {
                  setOpen(false);
                  trigger.current?.focus();
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
