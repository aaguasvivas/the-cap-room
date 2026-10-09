"use client";

import { useEffect, useState } from "react";
import type { CapsheetResponse, PlayersResponse, TeamsResponse } from "./apiTypes";

interface Settled<T> {
  url: string;
  data: T | null;
  error: string | null;
}

/**
 * Minimal fetch-into-state hook: the UI deliberately consumes its own REST API.
 * The last settled response is remembered with the URL it answered, so loading
 * is derived (no setState in the effect body) and the previous data stays on
 * screen while a new URL is in flight, which keeps team switches from flashing.
 */
export function useApi<T>(url: string | null): { data: T | null; error: string | null; loading: boolean } {
  const [settled, setSettled] = useState<Settled<T> | null>(null);

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    fetch(url)
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? `HTTP ${res.status}`);
        return res.json() as Promise<T>;
      })
      .then((data) => !cancelled && setSettled({ url, data, error: null }))
      .catch((e: Error) => !cancelled && setSettled({ url, data: null, error: e.message }));
    return () => {
      cancelled = true;
    };
  }, [url]);

  const fresh = !!url && settled?.url === url;
  return {
    data: url ? (settled?.data ?? null) : null,
    error: fresh ? (settled?.error ?? null) : null,
    loading: !!url && !fresh,
  };
}

export const useTeams = () => useApi<TeamsResponse>("/api/teams");
export const useCapsheet = (team: string | null) =>
  useApi<CapsheetResponse>(team ? `/api/teams/${team}/capsheet` : null);
export const usePlayers = (team: string | null) =>
  useApi<PlayersResponse>(team ? `/api/players?team=${team}` : null);
