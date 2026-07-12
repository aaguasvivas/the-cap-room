import { Suspense } from "react";
import { TradeClient } from "@/components/trade/TradeClient";

export const metadata = { title: "Trade Machine · The Cap Room" };

const CODE = /^[A-Z]{2,4}$/;

/**
 * Preload the exact API calls the client makes on mount so the data is in
 * flight during HTML parse, not after hydration. The UI still consumes the
 * REST API; this just starts the requests earlier.
 */
export default function TradePage({
  searchParams,
}: {
  searchParams: { a?: string; b?: string };
}) {
  const a = (searchParams.a ?? "SAC").toUpperCase();
  const b = (searchParams.b ?? "LAL").toUpperCase();
  const teams = [a, b].filter((t) => CODE.test(t));
  return (
    <>
      <link rel="preload" href="/api/teams" as="fetch" />
      {teams.map((t) => (
        <link key={t} rel="preload" href={`/api/players?team=${t}`} as="fetch" />
      ))}
      {teams.map((t) => (
        <link key={`${t}-cap`} rel="preload" href={`/api/teams/${t}/capsheet`} as="fetch" />
      ))}
      <Suspense>
        <TradeClient />
      </Suspense>
    </>
  );
}
