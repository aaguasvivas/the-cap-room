/**
 * Seed-data gate, run before every build (prebuild) and in CI.
 *
 * 1. Every /data file must parse against its Zod schema; malformed data
 *    fails the build.
 * 2. Every roster must re-sum, through the engine's cap math, to the exact
 *    published team total transcribed from the source. A single mistyped
 *    salary fails the build.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { computeCapSheet } from "../engine/capsheet";
import type { Player } from "../engine/types";
import {
  MetaSchema,
  PicksFileSchema,
  RosterFileSchema,
  StatsFileSchema,
} from "../lib/data/schemas";

const root = path.join(__dirname, "..");
const errors: string[] = [];
let checked = 0;

function fail(msg: string) {
  errors.push(msg);
}

// Rosters
const rosterDir = path.join(root, "data", "rosters");
for (const f of readdirSync(rosterDir).filter((f) => f.endsWith(".json") && !f.startsWith("_"))) {
  checked++;
  const raw = JSON.parse(readFileSync(path.join(rosterDir, f), "utf8"));
  const parsed = RosterFileSchema.safeParse(raw);
  if (!parsed.success) {
    fail(`${f}: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
    continue;
  }
  const file = parsed.data;
  if (`${file.team}.json` !== f) fail(`${f}: team code "${file.team}" doesn't match filename`);
  const sheet = computeCapSheet(file.team, file.players as Player[]);
  const published = file.publishedTotal["2026-27"];
  if (sheet.totalSalary !== published) {
    fail(
      `${f}: engine total $${sheet.totalSalary.toLocaleString()} ≠ published total $${published.toLocaleString()} (Δ $${(sheet.totalSalary - published).toLocaleString()}), a seeded figure is wrong`,
    );
  }
}

// Picks
const picksDir = path.join(root, "data", "picks");
for (const f of readdirSync(picksDir).filter((f) => f.endsWith(".json") && !f.startsWith("_"))) {
  checked++;
  const parsed = PicksFileSchema.safeParse(JSON.parse(readFileSync(path.join(picksDir, f), "utf8")));
  if (!parsed.success) {
    fail(`picks/${f}: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
  }
}

// Meta
checked++;
const meta = MetaSchema.safeParse(JSON.parse(readFileSync(path.join(root, "data", "meta.json"), "utf8")));
if (!meta.success) fail(`meta.json: ${meta.error.issues.map((i) => i.message).join("; ")}`);

// Stats (optional but must be valid if present)
const statsPath = path.join(root, "data", "stats", "players-2025-26.json");
if (existsSync(statsPath)) {
  checked++;
  const stats = StatsFileSchema.safeParse(JSON.parse(readFileSync(statsPath, "utf8")));
  if (!stats.success) {
    fail(`stats/players-2025-26.json: ${stats.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
  }
}

if (errors.length) {
  console.error(`✗ Seed data validation failed (${errors.length} error${errors.length > 1 ? "s" : ""}):\n`);
  for (const e of errors) console.error(`  • ${e}`);
  process.exit(1);
}
console.log(`✓ Seed data valid: ${checked} files checked, every roster re-sums to its published total.`);
