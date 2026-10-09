import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/icons";

export const metadata = { title: "Not found" };

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center py-16 text-center md:py-24">
      <div
        className="select-none rounded border-4 border-double border-illegal px-6 py-3 text-illegal"
        style={{ transform: "rotate(-2.5deg)" }}
      >
        <div className="font-display text-5xl font-bold uppercase tracking-wideish">404</div>
        <div className="font-mono text-[10px] uppercase tracking-widest">no such page on the books</div>
      </div>
      <h1 className="mt-8 font-display text-3xl font-bold uppercase tracking-wide text-bone">This page didn&apos;t clear waivers</h1>
      <p className="mt-3 text-[14px] leading-relaxed text-silver">
        The link may be old or mistyped. Everything that exists lives in the three modules.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link href="/" className="btn btn-primary btn-lg">
          Back to the league board <ArrowRightIcon />
        </Link>
        <Link href="/trade" className="btn btn-ghost btn-lg">
          Trade Machine
        </Link>
      </div>
    </div>
  );
}
