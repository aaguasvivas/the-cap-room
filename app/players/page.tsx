import { Suspense } from "react";
import { PlayersClient } from "@/components/players/PlayersClient";
import { PreloadApi } from "@/components/shell/PreloadApi";

export const metadata = { title: "Player Eval" };

/** Preload the page's own API calls; see components/shell/PreloadApi.tsx. */
export default function PlayersPage() {
  return (
    <>
      <PreloadApi hrefs={["/api/players", "/api/stats", "/api/teams"]} />
      <Suspense>
        <PlayersClient />
      </Suspense>
    </>
  );
}
