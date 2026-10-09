"use client";

import { useSyncExternalStore } from "react";
import { SearchIcon } from "@/components/ui/icons";
import { OPEN_SEARCH_EVENT } from "./CommandK";

const noSubscribe = () => () => {};
const isApple = () => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

/** Discoverable trigger for the ⌘K palette, labelled with the right shortcut per platform. */
export function SearchButton() {
  // Server render assumes ⌘; the client corrects it after hydration without a mismatch.
  const apple = useSyncExternalStore(noSubscribe, isApple, () => true);
  // Named by its own text, not aria-label, so the name always matches what is on screen (WCAG 2.5.3);
  // below sm the text is visually hidden, not removed. The key hint is visual; aria-keyshortcuts carries it.
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_SEARCH_EVENT))}
      aria-keyshortcuts="Meta+K Control+K"
      className="btn btn-ghost h-8 normal-case tracking-normal"
    >
      <SearchIcon />
      <span className="font-body text-[13px] max-sm:sr-only">Search players</span>
      <kbd aria-hidden className="hidden rounded-xs border border-graphite-line bg-graphite px-1.5 py-px font-mono text-[10px] text-silver md:inline">
        {apple ? "⌘K" : "Ctrl K"}
      </kbd>
    </button>
  );
}
