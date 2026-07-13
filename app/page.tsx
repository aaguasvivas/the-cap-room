import Link from "next/link";
import { usd, usdM } from "@/engine/format";
import { LUXURY_TAX } from "@/engine/constants";
import { listTeams, loadAllCapSheets, loadCapSheet, loadMeta } from "@/lib/data/load";
import { LeagueBoard, type BoardTeam } from "@/components/viz/LeagueBoard";

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
  { label: "A legal deal (with a hard-cap flag)", url: "/trade?a=SAC&b=LAL&give=1628370&get=1629020.lal-hardy" },
  { label: "A second-apron aggregation violation", url: "/trade?a=SAC&b=OKC&give=1629631&get=1627936.okc-jaylin-williams" },
  { label: "A Stepien-rule violation", url: "/trade?a=SAC&b=LAL&give=203897&get=1629029&picksA=2027.2028" },
] as const;

export default function Home() {
  const meta = loadMeta();
  const sac = loadCapSheet("SAC");
  const names = new Map(listTeams().map((t) => [t.team, t.teamName]));
  const board: BoardTeam[] = Object.values(loadAllCapSheets())
    .map((s) => ({
      team: s.team,
      teamName: names.get(s.team) ?? s.team,
      total: s.totalSalary,
      status: s.status,
    }))
    .sort((a, b) => b.total - a.total);

  return (
    <div className="mx-auto max-w-5xl space-y-8 py-4">
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

      <section className="rounded-md border border-graphite-line bg-graphite-raised p-4 md:p-5">
        <div className="mb-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 className="font-display text-base font-semibold uppercase tracking-wideish text-silver">
            The league board
          </h2>
          <span className="font-mono text-[11px] text-silver/70">
            {meta.leagueYear} team salary vs the five lines · seeded league
          </span>
          {sac && (
            <span className="ml-auto font-mono text-[11px] text-silver">
              SAC {usd(sac.totalSalary)} · {usdM(LUXURY_TAX - sac.totalSalary)} under the tax
            </span>
          )}
        </div>
        <LeagueBoard teams={board} asOf={meta.seedDate} />
      </section>

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
