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
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_SEARCH_EVENT))}
      aria-label="Search players"
      aria-keyshortcuts="Meta+K Control+K"
      className="btn btn-ghost h-8 normal-case tracking-normal"
    >
      <SearchIcon />
      <span className="hidden font-body text-[13px] sm:inline">Search players</span>
      <kbd className="hidden rounded-sm border border-graphite-line bg-graphite px-1.5 py-px font-mono text-[10px] text-silver md:inline">
        {apple ? "⌘K" : "Ctrl K"}
      </kbd>
    </button>
  );
}
