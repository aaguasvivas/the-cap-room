"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { usd } from "@/engine/format";
import type { ApiPlayer, PlayersResponse } from "@/lib/apiTypes";

/**
 * ⌘K palette: jump to any player in the seeded league and drop them straight
 * into the Trade Machine. Opens with Cmd/Ctrl+K, arrows to move, Enter to go.
 */
export function CommandK() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<ApiPlayer[]>([]);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQ("");
      setResults([]);
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  useEffect(() => {
    if (!open || !q.trim()) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => {
      fetch(`/api/players?q=${encodeURIComponent(q.trim())}`)
        .then((r) => r.json())
        .then((d: PlayersResponse) => {
          const needle = q.trim().toLowerCase();
          const ranked = [...d.players].sort((a, b) => {
            const aStarts = a.name.toLowerCase().startsWith(needle) ? 0 : 1;
            const bStarts = b.name.toLowerCase().startsWith(needle) ? 0 : 1;
            if (aStarts !== bStarts) return aStarts - bStarts;
            return (b.salary["2026-27"] ?? 0) - (a.salary["2026-27"] ?? 0);
          });
          setResults(ranked.slice(0, 8));
          setActive(0);
        })
        .catch(() => setResults([]));
    }, 140);
    return () => clearTimeout(t);
  }, [q, open]);

  const go = useCallback(
    (p: ApiPlayer) => {
      setOpen(false);
      const url =
        p.team === "SAC"
          ? `/trade?a=SAC&b=LAL&give=${p.playerId}`
          : `/trade?a=SAC&b=${p.team}&get=${p.playerId}`;
      router.push(url);
    },
    [router],
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 p-4 pt-[12vh]"
      onClick={() => setOpen(false)}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Player search"
        className="mx-auto w-full max-w-lg overflow-hidden rounded-lg border border-graphite-line bg-graphite-raised shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(a + 1, results.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, 0));
            } else if (e.key === "Enter" && results[active]) {
              go(results[active]!);
            }
          }}
          placeholder="jump to any player…"
          aria-label="Search all seeded players"
          className="w-full border-b border-graphite-line bg-transparent px-4 py-3.5 text-[15px] text-bone placeholder:text-silver/50 focus:outline-none"
        />
        {q.trim() && (
          <ul role="listbox" aria-label="Players" className="max-h-80 overflow-y-auto py-1">
            {results.map((p, i) => (
              <li key={`${p.team}-${p.playerId}`} role="option" aria-selected={i === active}>
                <button
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left ${
                    i === active ? "bg-royal text-bone" : "text-bone/90 hover:bg-graphite-panel"
                  }`}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(p)}
                >
                  <span className="min-w-0 flex-1 truncate text-[14px] font-medium">{p.name}</span>
                  <span className={`font-mono text-[11px] ${i === active ? "text-bone/80" : "text-silver"}`}>
                    {p.team} · {p.pos}
                  </span>
                  <span className="w-24 text-right font-mono text-[12px] tnum">
                    {usd(p.salary["2026-27"])}
                  </span>
                </button>
              </li>
            ))}
            {results.length === 0 && (
              <li className="px-4 py-3 font-mono text-[12px] text-silver">no players match</li>
            )}
          </ul>
        )}
        <div className="flex items-center gap-3 border-t border-graphite-line px-4 py-2 font-mono text-[10px] uppercase tracking-wide text-silver/70">
          <span>↑↓ move</span>
          <span>↵ build trade around player</span>
          <span className="ml-auto">esc close</span>
        </div>
      </div>
    </div>
  );
}
