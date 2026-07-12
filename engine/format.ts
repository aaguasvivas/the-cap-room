/** Money formatting for rule-ledger copy. Pure string helpers, no UI. */

/** Exact dollars: $19,096,000 */
export function usd(n: number): string {
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.abs(Math.round(n)).toLocaleString("en-US")}`;
}

/** Compact millions for headlines: $18.2M (one decimal, trimmed) */
export function usdM(n: number): string {
  const sign = n < 0 ? "-" : "";
  const m = Math.abs(n) / 1_000_000;
  const s = m >= 100 ? m.toFixed(1) : m.toFixed(m % 1 === 0 ? 0 : 1);
  return `${sign}$${s}M`;
}
