import { Suspense } from "react";
import { CapClient } from "@/components/cap/CapClient";
import { PreloadApi } from "@/components/shell/PreloadApi";

export const metadata = { title: "Cap Sheet" };

/** Preload the page's own API calls; see components/shell/PreloadApi.tsx. */
export default async function CapPage({
  searchParams,
}: {
  searchParams: Promise<{ team?: string }>;
}) {
  const team = ((await searchParams).team ?? "SAC").toUpperCase();
  const hrefs = ["/api/teams", ...(/^[A-Z]{2,4}$/.test(team) ? [`/api/teams/${team}/capsheet`] : [])];
  return (
    <>
      <PreloadApi hrefs={hrefs} />
      <Suspense>
        <CapClient />
      </Suspense>
    </>
  );
}
