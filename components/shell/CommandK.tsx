"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { usd } from "@/engine/format";
import type { ApiPlayer, PlayersResponse } from "@/lib/apiTypes";
import { foldForSearch } from "@/lib/names";
import { tradeUrlFor } from "@/lib/tradeUrl";

/** Fired by any "search" trigger (header button, mobile icon) to open the palette. */
export const OPEN_SEARCH_EVENT = "cap-room:open-search";

/**
 * ⌘K palette: jump to any player in the seeded league and drop them straight
 * into the Trade Machine. Opens with Cmd/Ctrl+K, arrows to move, Enter to go.
 */
export function CommandK() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_SEARCH_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_SEARCH_EVENT, onOpen);
    };
  }, []);

  // Mounted only while open, so every opening starts from a clean query.
  return open ? <Palette onClose={() => setOpen(false)} /> : null;
}

function Palette({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [found, setFound] = useState<{ query: string; players: ApiPlayer[] } | null>(null);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  /** Enter pressed before the current query's results arrived: act on them when they land. */
  const pendingEnter = useRef(false);
  /** Only keyboard moves scroll the list; hover must not make it jump. */
  const keyboardMove = useRef(false);
  const needle = q.trim().toLowerCase();

  // Focus the input on open; hand focus back to whatever opened the palette on close.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();
    return () => opener?.focus?.();
  }, []);

  useEffect(() => {
    if (!needle) return;
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      fetch(`/api/players?q=${encodeURIComponent(needle)}`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then((d: PlayersResponse) => {
          const folded = foldForSearch(needle);
          const ranked = d.players
            .filter((p) => p.contractType !== "dead")
            .sort((a, b) => {
              const aStarts = foldForSearch(a.name).startsWith(folded) ? 0 : 1;
              const bStarts = foldForSearch(b.name).startsWith(folded) ? 0 : 1;
              if (aStarts !== bStarts) return aStarts - bStarts;
              return (b.salary["2026-27"] ?? 0) - (a.salary["2026-27"] ?? 0);
            });
          setFound({ query: needle, players: ranked.slice(0, 8) });
          setActive(0);
        })
        .catch(() => {});
    }, 120);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [needle]);

  // The list on screen can still belong to the previous query while the next
  // request is in flight; Enter only ever acts on the current query's results.
  const results = needle && found ? found.players : [];
  const settled = found?.query === needle;

  const go = useCallback(
    (p: ApiPlayer) => {
      onClose();
      router.push(tradeUrlFor(p));
    },
    [onClose, router],
  );

  useEffect(() => {
    if (!settled || !pendingEnter.current) return;
    pendingEnter.current = false;
    const top = found?.players[0];
    if (top) go(top);
  }, [settled, found, go]);

  useEffect(() => {
    if (!keyboardMove.current) return;
    keyboardMove.current = false;
    document.getElementById(`player-opt-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 p-4 pt-[12vh] backdrop-blur-[2px]"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Player search"
        className="mx-auto w-full max-w-lg overflow-hidden rounded-lg border border-graphite-line bg-graphite-raised shadow-2xl shadow-black/60"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-graphite-line px-4">
          <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0 text-silver" fill="none" aria-hidden>
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.6" />
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              pendingEnter.current = false;
              if (!e.target.value.trim()) setFound(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                e.preventDefault();
                pendingEnter.current = false;
                keyboardMove.current = true;
                setActive((a) => (e.key === "ArrowDown" ? Math.min(a + 1, results.length - 1) : Math.max(a - 1, 0)));
              } else if (e.key === "Enter") {
                // Closing hands focus back to the opener; without this the same
                // Enter would "click" that button and reopen the palette.
                e.preventDefault();
                if (settled) {
                  if (results[active]) go(results[active]!);
                } else if (needle) {
                  pendingEnter.current = true;
                }
              } else if (e.key === "Tab") {
                // The input is the dialog's only control: keep focus inside the modal.
                e.preventDefault();
              }
            }}
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls={results.length > 0 ? "player-search-results" : undefined}
            aria-activedescendant={results[active] ? `player-opt-${active}` : undefined}
            aria-autocomplete="list"
            aria-label="Search all seeded players"
            placeholder="Jump to any player…"
            className="w-full bg-transparent py-3.5 text-[15px] text-bone placeholder:text-silver focus:outline-hidden"
          />
        </div>
        {results.length > 0 && (
          <ul id="player-search-results" role="listbox" aria-label="Players" className="max-h-80 overflow-y-auto py-1">
            {results.map((p, i) => (
              <li
                key={`${p.team}-${p.playerId}`}
                id={`player-opt-${i}`}
                role="option"
                aria-selected={i === active}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(p)}
                className={`flex cursor-pointer items-center gap-3 px-4 py-2.5 ${
                  i === active ? "bg-royal text-bone" : "text-bone/90"
                }`}
              >
                <span className="min-w-0 flex-1 truncate text-[14px] font-medium">{p.name}</span>
                <span className={`font-mono text-[11px] ${i === active ? "text-bone/85" : "text-silver"}`}>
                  {p.team} · {p.pos}
                </span>
                <span className="w-24 text-right font-mono text-[12px] tnum">{usd(p.salary["2026-27"])}</span>
              </li>
            ))}
          </ul>
        )}
        {needle && settled && results.length === 0 && (
          <p role="status" className="px-4 py-3 font-mono text-[12px] text-silver">
            No seeded player matches “{q.trim()}”
          </p>
        )}
        <div className="flex items-center gap-3 border-t border-graphite-line px-4 py-2 font-mono text-[10px] uppercase tracking-wide text-silver">
          <span>↑↓ move</span>
          <span>↵ build a trade around them</span>
          <span className="ml-auto">esc close</span>
        </div>
      </div>
    </div>
  );
}
