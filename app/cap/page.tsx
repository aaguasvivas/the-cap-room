import { Suspense } from "react";
import { CapClient } from "@/components/cap/CapClient";

export const metadata = { title: "Cap Sheet · The Cap Room" };

/** Preload the page's own API calls; see app/trade/page.tsx for the pattern. */
export default function CapPage({ searchParams }: { searchParams: { team?: string } }) {
  const team = (searchParams.team ?? "SAC").toUpperCase();
  return (
    <>
      <link rel="preload" href="/api/teams" as="fetch" />
      {/^[A-Z]{2,4}$/.test(team) && (
        <link rel="preload" href={`/api/teams/${team}/capsheet`} as="fetch" />
      )}
      <Suspense>
        <CapClient />
      </Suspense>
    </>
  );
}
