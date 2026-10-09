import { Suspense } from "react";
import { TradeClient } from "@/components/trade/TradeClient";
import { PreloadApi } from "@/components/shell/PreloadApi";

export const metadata = { title: "Trade Machine" };

const CODE = /^[A-Z]{2,4}$/;

/**
 * Preload the exact API calls the client makes on mount so the data is in
 * flight during HTML parse, not after hydration. The UI still consumes the
 * REST API; this just starts the requests earlier (see PreloadApi).
 */
export default async function TradePage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string; b?: string }>;
}) {
  const sp = await searchParams;
  const a = (sp.a ?? "SAC").toUpperCase();
  const b = (sp.b ?? "LAL").toUpperCase();
  const teams = [a, b].filter((t) => CODE.test(t));
  const hrefs = [
    "/api/teams",
    ...teams.map((t) => `/api/players?team=${t}`),
    ...teams.map((t) => `/api/teams/${t}/capsheet`),
  ];
  return (
    <>
      <PreloadApi hrefs={hrefs} />
      <Suspense>
        <TradeClient />
      </Suspense>
    </>
  );
}
