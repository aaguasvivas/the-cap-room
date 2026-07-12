import { Suspense } from "react";
import { PlayersClient } from "@/components/players/PlayersClient";

export const metadata = { title: "Player Eval · The Cap Room" };

/** Preload the page's own API calls; see app/trade/page.tsx for the pattern. */
export default function PlayersPage() {
  return (
    <>
      <link rel="preload" href="/api/players" as="fetch" />
      <link rel="preload" href="/api/stats" as="fetch" />
      <link rel="preload" href="/api/teams" as="fetch" />
      <Suspense>
        <PlayersClient />
      </Suspense>
    </>
  );
}
