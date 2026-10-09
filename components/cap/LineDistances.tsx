import { usd, usdM } from "@/engine/format";
import type { CapLineDistance } from "@/engine/types";

/**
 * Dollar distance to each line, phrased and coloured by what crossing it means:
 * clearing the floor is good, being over the cap is normal, being over the tax
 * or an apron is the expensive / restrictive side.
 */
function describe(d: CapLineDistance): { text: string; tone: string } {
  const gap = usdM(Math.abs(d.distance));
  const over = d.distance < 0;
  switch (d.key) {
    case "floor":
      return over ? { text: `${gap} above`, tone: "text-legal" } : { text: `${gap} short`, tone: "text-warn" };
    case "cap":
      return over ? { text: `${gap} over`, tone: "text-silver" } : { text: `${gap} of cap room`, tone: "text-legal" };
    default:
      return over ? { text: `${gap} over`, tone: "text-warn" } : { text: `${gap} below`, tone: "text-silver" };
  }
}

export function LineDistances({ distances }: { distances: CapLineDistance[] }) {
  const rows = [...distances].sort((a, b) => b.amount - a.amount);
  return (
    <dl className="divide-y divide-graphite-line/70 rounded-sm border border-graphite-line">
      {rows.map((d) => {
        const { text, tone } = describe(d);
        return (
          <div key={d.key} className="grid grid-cols-[1fr_auto] items-baseline gap-x-3 gap-y-0.5 px-3 py-2 sm:grid-cols-[8.5rem_1fr_auto]">
            <dt className="text-[13px] font-medium text-bone">{d.label}</dt>
            <dd className={`text-right font-mono text-[12px] tnum sm:order-last ${tone}`}>{text}</dd>
            <dd className="col-span-2 font-mono text-[11px] tnum text-dim sm:col-span-1">{usd(d.amount)}</dd>
          </div>
        );
      })}
    </dl>
  );
}
