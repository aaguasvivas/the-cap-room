import Link from "next/link";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { usdM } from "@/engine/format";
import { LUXURY_TAX } from "@/engine/constants";
import { buildProfiles } from "@/lib/percentiles";
import { listTeams, loadAllCapSheets, loadMeta, loadStats } from "@/lib/data/load";
import { SCENARIOS } from "@/lib/scenarios";
import { SITE, sourceUrl } from "@/lib/site";
import { LeagueBoard, type BoardTeam } from "@/components/viz/LeagueBoard";
import { ArrowRightIcon, ArrowUpRightIcon, GitHubIcon } from "@/components/ui/icons";

export const dynamic = "force-static";

/**
 * Counted from the suite at build time so the figure on the page can't drift
 * from the code. Returns null (and the stat is hidden) if the files aren't there.
 */
function countEngineTests(): number | null {
  try {
    const dir = path.join(process.cwd(), "engine", "__tests__");
    return readdirSync(dir)
      .filter((f) => f.endsWith(".test.ts"))
      .reduce((n, f) => n + (readFileSync(path.join(dir, f), "utf8").match(/^\s*(?:it|test)\(/gm)?.length ?? 0), 0);
  } catch {
    return null;
  }
}

const MODULES = [
  {
    href: "/trade",
    title: "Trade Machine",
    blurb:
      "Build a two-team deal from real rosters, cash and picks. The Rule Ledger itemizes every CBA check, pass or fail, with the arithmetic written out. Every trade is a shareable URL.",
  },
  {
    href: "/cap",
    title: "Cap Sheet",
    blurb:
      "Team salary as a gauge against the five lines, dollar distance to each, three years of commitments, and which exceptions its salary level allows, including the hard cap each one would trigger.",
  },
  {
    href: "/players",
    title: "Player Eval",
    blurb:
      "Contract-aware player cards with 2025-26 percentiles computed against every qualified player in the league, plus a radar to compare up to four.",
  },
] as const;

const BUILD_NOTES = [
  {
    title: "The engine is the product",
    body: "/engine is pure TypeScript: no React, no Next.js, no I/O. Each CBA rule is a function you can audit in one sitting, and boundaries are tested to the dollar ($209,015,000 is not over the first apron; $209,015,001 is).",
    link: { label: "engine/tradeRules.ts", href: sourceUrl("engine/tradeRules.ts") },
  },
  {
    title: "Data that can't drift",
    body: "Rosters are Zod-validated JSON snapshots with a source and access date. A pre-build gate re-sums every team through the engine and fails the deploy if a single dollar disagrees with the published total.",
    link: { label: "scripts/validate-data.ts", href: sourceUrl("scripts/validate-data.ts") },
  },
  {
    title: "It runs on its own API",
    body: "The UI reads the same REST routes you can curl. POST /api/trade/validate takes a proposal and returns the full ledger, so the trade logic is reusable outside this interface.",
    link: { label: "app/api/", href: sourceUrl("app/api/") },
  },
] as const;

const STACK = ["Next.js 16", "React 19", "TypeScript strict", "Zod", "Vitest", "Tailwind CSS", "Python ETL", "GitHub Actions", "Vercel"];

export default function Home() {
  const meta = loadMeta();
  const names = new Map(listTeams().map((t) => [t.team, t.teamName]));
  const sheets = Object.values(loadAllCapSheets());
  const board: BoardTeam[] = sheets
    .map((s) => ({ team: s.team, teamName: names.get(s.team) ?? s.team, total: s.totalSalary, status: s.status }))
    .sort((a, b) => b.total - a.total);
  const sac = sheets.find((s) => s.team === "SAC");
  const leagueTotal = sheets.reduce((sum, s) => sum + s.totalSalary, 0);
  const qualified = buildProfiles(loadStats().players).qualifiedCount;
  const tests = countEngineTests();

  const proof = [
    tests !== null && { figure: String(tests), label: "engine tests", note: "golden CBA scenarios, run in CI on every push to main" },
    { figure: `${sheets.length}/${sheets.length}`, label: "rosters reconciled", note: "each re-sums to its published total, to the dollar" },
    { figure: `$${(leagueTotal / 1e9).toFixed(2)}B`, label: "salary on the board", note: "every contract traced to a dated public source" },
    { figure: String(qualified), label: "qualified players", note: "the pool behind every league percentile" },
  ].filter(Boolean) as { figure: string; label: string; note: string }[];

  return (
    <div className="mx-auto max-w-5xl space-y-14 pb-6 md:space-y-16">
      {/* Hero */}
      <section className="relative pt-2 md:pt-6">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 -top-24 h-72 w-[36rem] max-w-[100vw] rounded-full bg-royal/25 blur-3xl"
        />
        <div className="relative">
          <p className="eyebrow text-royal-ink">NBA salary cap · 2023 CBA · {meta.leagueYear} league year</p>
          <h1 className="mt-4 max-w-3xl font-display text-[2.75rem] font-bold uppercase leading-[0.95] tracking-tightest text-bone sm:text-6xl md:text-7xl">
            The trade machine that shows its work.
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-silver md:text-base">
            A front-office console for NBA roster construction. A pure TypeScript rules engine checks every
            proposed trade against salary matching, both aprons, hard-cap triggers, cash limits, roster bounds
            and the Stepien rule, then explains the verdict with the arithmetic.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link href={SCENARIOS[2]!.url} className="btn btn-primary btn-lg">
              Try a trade <ArrowRightIcon />
            </Link>
            <a href={SITE.repoUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-lg">
              <GitHubIcon className="h-3.5 w-3.5" /> Read the source
            </a>
            <span className="text-[13px] text-dim">
              Designed and built by{" "}
              <a href={SITE.authorUrl} target="_blank" rel="noreferrer" className="link text-silver">
                {SITE.author}
              </a>
            </span>
          </div>
        </div>
      </section>

      {/* Proof strip: every figure is computed from the repo at build time */}
      <section aria-label="By the numbers">
        <dl className="grid grid-cols-2 overflow-hidden rounded-md border border-graphite-line bg-graphite-line [gap:1px] lg:grid-cols-4">
          {proof.map((p) => (
            <div key={p.label} className="bg-graphite-raised px-4 py-4 md:px-5">
              <dt className="sr-only">{p.label}</dt>
              <dd>
                <span className="block font-display text-3xl font-semibold tnum text-bone md:text-4xl">{p.figure}</span>
                <span className="mt-1 block font-mono text-[11px] uppercase tracking-wide text-royal-ink">{p.label}</span>
                <span className="mt-1 block text-[12px] leading-snug text-dim">{p.note}</span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* League board */}
      <section aria-labelledby="board-title" className="rounded-md border border-graphite-line bg-graphite-raised p-4 md:p-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <div>
            <h2 id="board-title" className="font-display text-2xl font-semibold uppercase tracking-wide text-bone">
              The league board
            </h2>
            <p className="mt-1 text-[13px] text-silver">
              {meta.leagueYear} team salary against the five lines. August is when contenders duck the second apron.
            </p>
          </div>
          {sac && (
            <p className="font-mono text-[11px] text-silver">
              <span className="text-royal-ink">◆ SAC</span> {usdM(sac.totalSalary)} ·{" "}
              <span className={sac.totalSalary > LUXURY_TAX ? "text-warn" : "text-legal"}>
                {usdM(Math.abs(LUXURY_TAX - sac.totalSalary))} {sac.totalSalary > LUXURY_TAX ? "over" : "under"} the tax
              </span>
            </p>
          )}
        </div>
        <LeagueBoard teams={board} asOf={meta.seedDate} />
      </section>

      {/* Scenarios */}
      <section aria-labelledby="try-title">
        <SectionHead id="try-title" eyebrow="60 seconds" title="Three trades to try" />
        <ul className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {SCENARIOS.map((s) => (
            <li key={s.url}>
              <Link
                href={s.url}
                className="group flex h-full flex-col rounded-md border border-graphite-line bg-graphite-raised p-4 transition-colors hover:border-royal-soft"
              >
                <span
                  className={`self-start rounded-sm border-2 border-double px-1.5 py-0.5 font-display text-[13px] font-bold uppercase tracking-wideish ${
                    s.verdict === "legal" ? "border-legal text-legal" : "border-illegal text-illegal"
                  }`}
                >
                  {s.verdict}
                </span>
                <span className="mt-3 font-display text-lg font-semibold leading-tight text-bone">{s.name}</span>
                <span className="mt-1.5 flex-1 text-[13px] leading-relaxed text-silver">{s.why}</span>
                <span className="mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-royal-ink group-hover:text-bone">
                  Open in the Trade Machine <ArrowRightIcon className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Modules */}
      <section aria-labelledby="modules-title">
        <SectionHead id="modules-title" eyebrow="Three modules" title="One rules engine underneath" />
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {MODULES.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="group rounded-md border border-graphite-line bg-graphite-raised p-4 transition-colors hover:border-royal-soft"
            >
              <h3 className="flex items-center gap-2 font-display text-xl font-semibold uppercase tracking-wide text-bone group-hover:text-royal-ink">
                {m.title} <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-silver">{m.blurb}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* How it's built */}
      <section aria-labelledby="built-title">
        <SectionHead id="built-title" eyebrow="Under the hood" title="How it's built" />
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {BUILD_NOTES.map((n) => (
            <article key={n.title} className="flex flex-col rounded-md border border-graphite-line bg-graphite-raised p-4">
              <h3 className="font-display text-lg font-semibold uppercase tracking-wide text-bone">{n.title}</h3>
              <p className="mt-2 flex-1 text-[13px] leading-relaxed text-silver">{n.body}</p>
              <a
                href={n.link.href}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 self-start font-mono text-[11px] text-royal-ink hover:text-bone"
              >
                {n.link.label} <ArrowUpRightIcon />
              </a>
            </article>
          ))}
        </div>
        <ul aria-label="Stack" className="mt-4 flex flex-wrap gap-1.5">
          {STACK.map((s) => (
            <li key={s} className="rounded-sm border border-graphite-line px-2 py-1 font-mono text-[11px] text-silver">
              {s}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function SectionHead({ id, eyebrow, title }: { id: string; eyebrow: string; title: string }) {
  return (
    <div className="mb-4">
      <p className="eyebrow text-dim">{eyebrow}</p>
      <h2 id={id} className="mt-1 font-display text-2xl font-semibold uppercase tracking-wide text-bone">
        {title}
      </h2>
    </div>
  );
}
