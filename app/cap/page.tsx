import { Suspense } from "react";
import { CapClient } from "@/components/cap/CapClient";

export const metadata = { title: "Cap Sheet · The Cap Room" };

export default function CapPage() {
  return (
    <Suspense>
      <CapClient />
    </Suspense>
  );
}
