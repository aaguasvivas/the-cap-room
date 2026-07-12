import { Suspense } from "react";
import { TradeClient } from "@/components/trade/TradeClient";

export const metadata = { title: "Trade Machine — The Cap Room" };

export default function TradePage() {
  return (
    <Suspense>
      <TradeClient />
    </Suspense>
  );
}
