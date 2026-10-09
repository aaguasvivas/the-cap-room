"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { usd, usdM } from "@/engine/format";
import { useCapsheet, useTeams } from "@/lib/hooks";
import { Card, PageHeader, StatusChip, WarnChip } from "@/components/ui/bits";
import { TeamSelect } from "@/components/ui/TeamSelect";
import { Thermometer } from "@/components/viz/Thermometer";
import { ContractTable } from "./ContractTable";
import { ExceptionsPanel } from "./ExceptionsPanel";
import { LineDistances } from "./LineDistances";
import { MultiYearStrip } from "./MultiYearStrip";

export function CapClient() {
  const router = useRouter();
  const params = useSearchParams();
  const team = (params.get("team") ?? "SAC").toUpperCase();

  const teams = useTeams();
  const sheet = useCapsheet(team);
  const s = sheet.data;

  return (
    <div className="space-y-5">
      <PageHeader title="Cap Sheet" note={s ? `figures as of ${s.asOf}` : undefined}>
        {teams.data && (
          <TeamSelect
            id="cap-team"
            label="Team"
            teams={teams.data.teams}
            value={team}
            onChange={(t) => router.replace(`/cap?team=${t}`, { scroll: false })}
          />
        )}
      </PageHeader>

      {sheet.error ? (
        <p role="alert" className="rounded border border-illegal/60 bg-illegal/10 px-4 py-3 text-sm text-bone">
          {sheet.error}
        </p>
      ) : !s ? (
        <div className="min-h-[640px]" aria-busy>
          <p className="animate-pulse font-mono text-sm text-silver">Computing cap sheet…</p>
        </div>
      ) : (
        <div className={`space-y-4 transition-opacity ${sheet.loading ? "opacity-60" : ""}`} aria-busy={sheet.loading}>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card title={`${s.teamName} vs the five lines`} className="lg:col-span-2">
              {/* Side by side only where the card is wide enough to keep the gauge at full
                  size; in between (md to xl, two-column page) it stacks. */}
              <div className="grid grid-cols-1 items-center gap-6 sm:grid-cols-[minmax(0,240px)_1fr] md:grid-cols-1 xl:grid-cols-[240px_minmax(0,1fr)]">
                <Thermometer key={s.team} total={s.totalSalary} />
                <div className="space-y-4">
                  <div>
                    <p className="eyebrow">Team salary</p>
                    <p className="mt-1 font-display text-5xl font-semibold tnum tracking-tightest text-bone">
                      {usdM(s.totalSalary)}
                    </p>
                    <p className="mt-1 font-mono text-[12px] tnum text-silver">{usd(s.totalSalary)}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <StatusChip status={s.status} label={s.statusLabel} />
                      {s.belowFloor && <WarnChip>below salary floor</WarnChip>}
                    </div>
                    <p className="mt-2 font-mono text-[11px] text-dim">
                      {s.standardCount} standard · {s.twoWayCount} two-way · {usdM(s.deadMoney)} dead money
                    </p>
                  </div>
                  <LineDistances distances={s.distances} />
                </div>
              </div>
            </Card>
            <Card title="Exceptions">
              <ExceptionsPanel exceptions={s.exceptions} />
            </Card>
          </div>

          <Card title="Committed salary, next three years">
            <MultiYearStrip multiYear={s.multiYear} />
          </Card>

          <Card title="Contracts">
            <ContractTable players={s.players} />
          </Card>
        </div>
      )}
    </div>
  );
}
