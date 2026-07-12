"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { usd, usdM } from "@/engine/format";
import { useCapsheet, useTeams } from "@/lib/hooks";
import { Card, StatusChip, WarnChip } from "@/components/ui/bits";
import { TeamSelect } from "@/components/ui/TeamSelect";
import { Thermometer } from "@/components/viz/Thermometer";
import { ContractTable } from "./ContractTable";
import { ExceptionsPanel } from "./ExceptionsPanel";
import { MultiYearStrip } from "./MultiYearStrip";

export function CapClient() {
  const router = useRouter();
  const params = useSearchParams();
  const team = (params.get("team") ?? "SAC").toUpperCase();

  const teams = useTeams();
  const sheet = useCapsheet(team);

  if (sheet.error) {
    return (
      <p className="rounded border border-illegal/60 bg-illegal/10 px-4 py-3 text-sm text-bone">
        {sheet.error}
      </p>
    );
  }
  const s = sheet.data;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-bone">Cap Sheet</h1>
        {teams.data && (
          <TeamSelect
            id="cap-team"
            label="Team"
            teams={teams.data.teams}
            value={team}
            onChange={(t) => router.replace(`/cap?team=${t}`, { scroll: false })}
          />
        )}
        {s && (
          <div className="flex flex-wrap items-center gap-2">
            <StatusChip status={s.status} label={s.statusLabel} />
            {s.belowFloor && <WarnChip>below salary floor</WarnChip>}
            <span className="font-mono text-[11px] text-silver">
              {s.standardCount} standard · {s.twoWayCount} two-way · dead {usdM(s.deadMoney)}
            </span>
          </div>
        )}
      </div>

      {!s ? (
        <p className="animate-pulse font-mono text-sm text-silver">computing cap sheet…</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card title={`${s.teamName} vs the five lines`} className="lg:col-span-2">
              <Thermometer total={s.totalSalary} />
              <p className="mt-2 font-mono text-[11px] text-silver">
                team salary {usd(s.totalSalary)} · figures as of {s.asOf}
              </p>
            </Card>
            <Card title="Exceptions available">
              <ExceptionsPanel exceptions={s.exceptions} />
            </Card>
          </div>

          <Card title="Committed salary, next three years">
            <MultiYearStrip multiYear={s.multiYear} />
          </Card>

          <Card title="Contracts">
            <ContractTable players={s.players} />
          </Card>
        </>
      )}
    </div>
  );
}
