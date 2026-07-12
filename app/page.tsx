import Link from "next/link";
import { statusLabel } from "@/engine/capsheet";
import { usd, usdM } from "@/engine/format";
import { LUXURY_TAX } from "@/engine/constants";
import { loadCapSheet, loadMeta } from "@/lib/data/load";
import { StatusChip } from "@/components/ui/bits";

const MODULES = [
  {
    href: "/cap",
    title: "Cap Sheet",
    blurb: "Team salary against the five lines, contracts three years out, and which exceptions are live, with the hard cap each one would trigger.",
  },
  {
    href: "/trade",
    title: "Trade Machine",
    blurb: "Build a two-team deal and get the full rule ledger: every CBA check itemized, pass or fail, with the arithmetic shown. Illegal verdicts explain themselves.",
  },
  {
    href: "/players",
    title: "Player Eval",
    blurb: "Contract-aware player cards with league-percentile profiles from the committed stats snapshot, and side-by-side comparison.",
  },
] as const;

const SCENARIOS = [
  { label: "A legal deal (with a hard-cap flag)", url: "/trade?a=SAC&b=BKN&give=1628370&get=1629651" },
  { label: "A second-apron aggregation violation", url: "/trade?a=SAC&b=OKC&give=1629631&get=1627936.okc-jaylin-williams" },
  { label: "A Stepien-rule violation", url: "/trade?a=SAC&b=LAL&give=203897&get=1629029&picksA=2027.2028" },
] as const;

export default function Home() {
  const meta = loadMeta();
  const sac = loadCapSheet("SAC");

  return (
    <div className="mx-auto max-w-4xl space-y-8 py-4">
      <div>
        <h1 className="font-display text-5xl font-bold uppercase tracking-tightest text-bone md:text-6xl">
          The Cap Room
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-silver">
          A front-office console for NBA roster construction under the 2023 CBA: a pure, unit-tested
          rules engine with a war-room interface on top. Built as an engineering demo for the
          Sacramento Kings. Every figure traces to a dated public source.
        </p>
      </div>

      {sac && (
        <Link
          href="/cap"
          className="block rounded-md border border-graphite-line bg-graphite-raised px-5 py-4 hover:border-royal-soft transition-colors"
        >
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="font-display text-lg font-semibold uppercase tracking-wide text-bone">
              Sacramento Kings
            </span>
            <StatusChip status={sac.status} label={statusLabel(sac.status)} />
            <span className="ml-auto font-display text-3xl font-semibold tnum text-bone">
              {usdM(sac.totalSalary)}
            </span>
          </div>
          <p className="mt-1.5 font-mono text-[11px] text-silver">
            {usd(sac.totalSalary)} committed for {meta.leagueYear} · {usdM(LUXURY_TAX - sac.totalSalary)} under the tax line ·{" "}
            {sac.standardCount} standard contracts · open the cap sheet →
          </p>
        </Link>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {MODULES.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="group rounded-md border border-graphite-line bg-graphite-raised p-4 transition-colors hover:border-royal-soft"
          >
            <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-bone group-hover:text-royal-soft">
              {m.title} →
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-silver">{m.blurb}</p>
          </Link>
        ))}
      </div>

      <div className="rounded-md border border-royal-bright/40 bg-royal-faint/40 p-4">
        <h2 className="font-mono text-[11px] uppercase tracking-wideish text-royal-soft">
          60 seconds? Load a scenario
        </h2>
        <ul className="mt-2 space-y-1.5">
          {SCENARIOS.map((s) => (
            <li key={s.url}>
              <Link href={s.url} className="text-[14px] font-medium text-bone underline decoration-royal-soft/50 underline-offset-4 hover:decoration-royal-soft">
                {s.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
