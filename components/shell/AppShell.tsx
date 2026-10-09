import Link from "next/link";
import type { Meta } from "@/lib/data/schemas";
import { SITE } from "@/lib/site";
import { ArrowUpRightIcon, BrandMark, GitHubIcon } from "@/components/ui/icons";
import { CommandK } from "./CommandK";
import { NavRail } from "./NavRail";
import { SearchButton } from "./SearchButton";

export function AppShell({ meta, children }: { meta: Meta; children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only z-50 rounded bg-royal px-3 py-2 text-sm text-bone focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
      >
        Skip to content
      </a>
      <CommandK />
      <header className="sticky top-0 z-40 border-b border-graphite-line bg-graphite">
        <div className="flex h-14 items-center gap-3 px-4 md:px-6">
          <Link href="/" className="group flex items-center gap-2.5" aria-label="The Cap Room, home">
            <BrandMark className="h-7 w-7" />
            <span className="font-display text-xl font-bold uppercase tracking-wideish text-bone transition-colors group-hover:text-royal-ink md:text-2xl">
              The Cap Room
            </span>
          </Link>
          <span
            className="hidden rounded-sm border border-royal-bright/60 bg-royal-faint px-1.5 py-0.5 font-mono text-[11px] font-medium text-royal-ink min-[420px]:inline"
            title="League year"
          >
            {meta.leagueYear}
          </span>
          <span className="ml-auto hidden font-mono text-[11px] text-dim lg:block" title={meta.dataNote}>
            data as of {meta.seedDate}
          </span>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <SearchButton />
            <a
              href={SITE.repoUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Source code on GitHub"
              title="Source code on GitHub"
              className="btn btn-ghost h-8 w-8 px-0"
            >
              <GitHubIcon />
            </a>
          </div>
        </div>
        {/* Mobile module tabs */}
        <div className="border-t border-graphite-line px-2 py-1.5 md:hidden">
          <NavRail />
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="hidden w-52 shrink-0 border-r border-graphite-line md:block">
          <div className="sticky top-14 flex h-[calc(100dvh-3.5rem)] flex-col p-3">
            <NavRail />
            <div className="mt-auto space-y-2 border-t border-graphite-line px-3 pt-4 pb-2">
              <p className="eyebrow text-[10px] text-dim">Designed and built by</p>
              <a
                href={SITE.authorUrl}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-1 text-[13px] font-medium text-bone hover:text-royal-ink"
              >
                {SITE.author}
                <ArrowUpRightIcon className="h-3 w-3 text-dim group-hover:text-royal-ink" />
              </a>
              <a
                href={SITE.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 font-mono text-[11px] text-silver hover:text-bone"
              >
                <GitHubIcon className="h-3.5 w-3.5" /> Source on GitHub
              </a>
            </div>
          </div>
        </aside>
        <main id="main" className="min-w-0 flex-1 px-4 py-5 md:px-8 md:py-7">
          {children}
        </main>
      </div>

      <footer className="border-t border-graphite-line px-4 py-4 md:px-6">
        <div className="flex flex-col gap-1.5 text-[12px] leading-relaxed text-dim sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <p>
            Designed and built by{" "}
            <a href={SITE.authorUrl} target="_blank" rel="noreferrer" className="text-silver underline-offset-4 hover:text-bone hover:underline">
              {SITE.author}
            </a>
            {" · "}
            <a href={SITE.repoUrl} target="_blank" rel="noreferrer" className="text-silver underline-offset-4 hover:text-bone hover:underline">
              Source
            </a>
          </p>
          <p>
            Unofficial demo. Not affiliated with the Sacramento Kings or the NBA. Data as of {meta.seedDate}.
          </p>
        </div>
      </footer>
    </div>
  );
}
