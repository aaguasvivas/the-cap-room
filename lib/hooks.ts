"use client";

import { useEffect, useState } from "react";
import type { CapsheetResponse, PlayersResponse, TeamsResponse } from "./apiTypes";

/** Minimal fetch-into-state hook: the UI deliberately consumes its own REST API. */
export function useApi<T>(url: string | null): { data: T | null; error: string | null; loading: boolean } {
  const [state, setState] = useState<{ data: T | null; error: string | null; loading: boolean }>({
    data: null,
    error: null,
    loading: !!url,
  });

  useEffect(() => {
    if (!url) {
      setState({ data: null, error: null, loading: false });
      return;
    }
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    fetch(url)
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? `HTTP ${res.status}`);
        return res.json() as Promise<T>;
      })
      .then((data) => !cancelled && setState({ data, error: null, loading: false }))
      .catch((e: Error) => !cancelled && setState({ data: null, error: e.message, loading: false }));
    return () => {
      cancelled = true;
    };
  }, [url]);

  return state;
}

export const useTeams = () => useApi<TeamsResponse>("/api/teams");
export const useCapsheet = (team: string | null) =>
  useApi<CapsheetResponse>(team ? `/api/teams/${team}/capsheet` : null);
export const usePlayers = (team: string | null) =>
  useApi<PlayersResponse>(team ? `/api/players?team=${team}` : null);
