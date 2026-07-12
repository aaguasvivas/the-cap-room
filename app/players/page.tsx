import { Suspense } from "react";
import { PlayersClient } from "@/components/players/PlayersClient";

export const metadata = { title: "Player Eval — The Cap Room" };

export default function PlayersPage() {
  return (
    <Suspense>
      <PlayersClient />
    </Suspense>
  );
}
