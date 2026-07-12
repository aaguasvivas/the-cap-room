import Link from "next/link";
import type { Meta } from "@/lib/data/schemas";
import { CommandK } from "./CommandK";
import { KHint } from "./KHint";
import { NavRail } from "./NavRail";

export function AppShell({ meta, children }: { meta: Meta; children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col">
      <CommandK />
      <header className="sticky top-0 z-40 border-b border-graphite-line bg-graphite">
        <div className="flex items-center gap-3 px-4 py-2.5 md:px-6">
          <Link href="/" className="group flex items-baseline gap-2">
            <span className="font-display text-xl md:text-2xl font-bold uppercase tracking-wideish text-bone group-hover:text-royal-soft transition-colors">
              The Cap Room
            </span>
          </Link>
          <span
            className="rounded-sm border border-royal-bright/60 bg-royal-faint px-1.5 py-0.5 font-mono text-[11px] font-medium text-royal-soft"
            title="League year"
          >
            {meta.leagueYear}
          </span>
          <span className="ml-auto hidden sm:block font-mono text-[11px] text-silver" title={meta.dataNote}>
            data as of {meta.seedDate}
          </span>
          <span className="ml-auto sm:ml-0">
            <KHint />
          </span>
        </div>
        {/* Mobile module tabs */}
        <div className="border-t border-graphite-line px-2 py-1.5 md:hidden overflow-x-auto">
          <NavRail />
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="hidden md:block w-52 shrink-0 border-r border-graphite-line p-3">
          <div className="sticky top-16">
            <NavRail />
            <p className="mt-6 px-3 font-mono text-[10px] leading-relaxed text-silver/70">
              War-room console for roster construction under the 2023 CBA.
            </p>
          </div>
        </aside>
        <main className="min-w-0 flex-1 px-4 py-5 md:px-8 md:py-7">{children}</main>
      </div>

      <footer className="border-t border-graphite-line px-4 py-3 md:px-6">
        <p className="text-[11px] leading-relaxed text-silver/80">
          Unofficial demo by Adelson Aguasvivas. Not affiliated with the Sacramento Kings or the
          NBA. Data as of {meta.seedDate}.
        </p>
      </footer>
    </div>
  );
}
