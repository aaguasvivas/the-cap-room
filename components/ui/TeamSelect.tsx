"use client";

import type { TeamSummary } from "@/lib/apiTypes";
import { usdM } from "@/engine/format";

export function TeamSelect({
  id,
  label,
  teams,
  value,
  onChange,
  exclude,
}: {
  id: string;
  label: string;
  teams: TeamSummary[];
  value: string;
  onChange: (team: string) => void;
  exclude?: string;
}) {
  return (
    <label htmlFor={id} className="flex min-w-0 items-center gap-2">
      {label && (
        <span className="font-mono text-[11px] uppercase tracking-wideish text-silver">{label}</span>
      )}
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="max-w-full min-w-0 rounded border border-graphite-line bg-graphite-panel px-2.5 py-1.5 text-sm font-medium text-bone hover:border-royal-soft"
      >
        {teams
          .filter((t) => t.team !== exclude)
          .map((t) => (
            <option key={t.team} value={t.team}>
              {t.team} · {t.teamName} ({usdM(t.totalSalary)})
            </option>
          ))}
      </select>
    </label>
  );
}
