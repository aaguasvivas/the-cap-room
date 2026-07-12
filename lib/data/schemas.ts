import { z } from "zod";

/**
 * Zod schemas for every seed file in /data. The build fails if a seed file
 * is malformed (see scripts/validate-data.ts) — bad data never ships.
 */

export const SalarySchema = z
  .object({
    "2026-27": z.number().int().nonnegative(),
    "2027-28": z.number().int().nonnegative().optional(),
    "2028-29": z.number().int().nonnegative().optional(),
  })
  .strict();

export const PlayerSchema = z
  .object({
    playerId: z.string().min(1),
    name: z.string().min(1),
    pos: z.enum(["PG", "SG", "SF", "PF", "C"]),
    age: z.number().int().min(17).max(50),
    salary: SalarySchema,
    contractType: z.enum(["standard", "two-way", "rookie-scale", "min", "dead"]),
    options: z
      .array(
        z.object({ year: z.string(), type: z.enum(["player", "team", "ETO"]) }).strict(),
      )
      .optional(),
    tradeRestrictions: z
      .array(z.enum(["no-trade", "recently-signed", "cannot-aggregate"]))
      .optional(),
    returnEligibleDate: z.string().optional(),
    guaranteed: z.boolean(),
  })
  .strict();

export const RosterFileSchema = z
  .object({
    team: z.string().regex(/^[A-Z]{2,4}$/),
    teamName: z.string().min(1),
    /** ISO date the figures were captured. */
    asOf: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    /** Pointer into docs/sources.md. */
    source: z.string().min(1),
    /**
     * The source's own published 2026-27 team total. scripts/validate-data.ts
     * recomputes team salary through the engine and fails the build if the
     * seeded figures don't sum to this exactly — a typo can't ship.
     */
    publishedTotal: z.object({ "2026-27": z.number().int().nonnegative() }).strict(),
    players: z.array(PlayerSchema).min(1),
  })
  .strict()
  .superRefine((file, ctx) => {
    const seen = new Set<string>();
    for (const p of file.players) {
      if (seen.has(p.playerId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `duplicate playerId "${p.playerId}" in ${file.team}`,
        });
      }
      seen.add(p.playerId);
    }
  });

export const PicksFileSchema = z
  .object({
    team: z.string().regex(/^[A-Z]{2,4}$/),
    asOf: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    source: z.string().min(1),
    firstRound: z.array(
      z
        .object({
          year: z.number().int().min(2027).max(2033),
          status: z.enum(["owned", "traded", "swap"]),
          counterparty: z.string().optional(),
          protections: z.string().optional(),
          note: z.string().optional(),
        })
        .strict(),
    ),
  })
  .strict();

export const StatLineSchema = z
  .object({
    playerId: z.string(),
    name: z.string(),
    team: z.string(),
    gp: z.number(),
    min: z.number(),
    /** Per-75-possession scoring; rates as fractions of 1 except usg/ts which are 0–1. */
    ptsPer75: z.number(),
    ts: z.number().nullable(),
    usg: z.number().nullable(),
    astPct: z.number().nullable(),
    tovPct: z.number().nullable(),
    rebPct: z.number().nullable(),
    stlPer75: z.number(),
    blkPer75: z.number(),
    threePAr: z.number().nullable(),
    ftr: z.number().nullable(),
  })
  .strict();

export const StatsFileSchema = z
  .object({
    season: z.string(),
    pulledAt: z.string().nullable(),
    source: z.string(),
    players: z.array(StatLineSchema),
  })
  .strict();

export const MetaSchema = z
  .object({
    leagueYear: z.literal("2026-27"),
    /** The load-bearing honesty date shown in the footer. */
    seedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    dataNote: z.string().min(1),
  })
  .strict();

/** Wire schema for POST /api/trade/validate. */
export const TradeSideSchema = z
  .object({
    team: z.string().regex(/^[A-Z]{2,4}$/),
    playerIds: z.array(z.string().min(1)).max(8),
    cash: z.number().int().nonnegative().max(50_000_000).optional(),
    pickIds: z.array(z.string().regex(/^[A-Z]{2,4}-\d{4}-1st$/)).max(7).optional(),
  })
  .strict();

export const TradeProposalSchema = z
  .object({
    leagueYear: z.literal("2026-27"),
    sides: z.tuple([TradeSideSchema, TradeSideSchema]),
  })
  .strict();

export type RosterFile = z.infer<typeof RosterFileSchema>;
export type PicksFile = z.infer<typeof PicksFileSchema>;
export type StatsFile = z.infer<typeof StatsFileSchema>;
export type StatLine = z.infer<typeof StatLineSchema>;
export type Meta = z.infer<typeof MetaSchema>;
