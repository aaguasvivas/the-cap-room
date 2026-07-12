"use client";

/** Discoverable trigger for the palette; dispatches the same Cmd/Ctrl+K path. */
export function KHint() {
  return (
    <button
      onClick={() =>
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))
      }
      title="Jump to any player"
      className="rounded border border-graphite-line bg-graphite-panel px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-silver hover:border-royal-soft hover:text-bone"
    >
      ⌘K players
    </button>
  );
}
