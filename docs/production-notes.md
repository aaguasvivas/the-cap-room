# Production notes

The demo is deliberately zero-infra: JSON snapshots, a pure engine, one
Vercel deploy. Here is the same product as a production system inside a
basketball-operations stack.

## Storage: Postgres

```sql
-- Reference data
players(
  player_id      bigint primary key,        -- nba.com person id
  full_name      text not null,
  born           date,
  position       text
);

teams(team_code text primary key, name text not null);

-- One row per contract season per player: the cap sheet is a query, not a file
contract_seasons(
  id             bigserial primary key,
  player_id      bigint references players,
  team_code      text references teams,
  league_year    text not null,             -- '2026-27'
  cap_hit        bigint not null,           -- integer dollars, never floats
  contract_type  text not null,             -- standard | two-way | rookie-scale | min | dead
  option_type    text,                      -- player | team | eto | null
  guaranteed     bigint,                    -- guaranteed portion of cap_hit
  signed_at      date,                      -- drives recently-signed restrictions
  source         text not null,             -- provenance, always
  valid_from     timestamptz not null,      -- bitemporal: figures change mid-season
  valid_to       timestamptz
);

draft_picks(
  id             bigserial primary key,
  original_team  text references teams,     -- whose draft slot
  holder_team    text references teams,     -- who owns it today
  draft_year     int not null,
  round          int not null,
  swap_with      text,                      -- counterparty when swap-encumbered
  protections    jsonb,                     -- e.g. {"top": 12, "rolls_to": 2029}
  source         text not null
);

-- Every roster move, importable and replayable
transactions(
  id             bigserial primary key,
  occurred_at    timestamptz not null,
  kind           text not null,             -- trade | signing | waiver | extension | exercise-option
  payload        jsonb not null,            -- normalized description of the move
  source         text not null
);

-- League constants versioned by league year (cap, tax, aprons, MLEs…)
league_constants(league_year text primary key, values jsonb not null, source text);

-- Append-only stat snapshots; percentiles are materialized views over these
player_season_stats(
  player_id    bigint references players,
  season       text not null,
  pulled_at    timestamptz not null,
  stat         jsonb not null,
  primary key (player_id, season, pulled_at)
);
```

Cap sheets, apron status, and trade validation stay in the **pure TypeScript
engine**; the database stores facts, the engine computes meaning. The same
engine package runs in the web app and in any nightly checks (e.g. "which
teams are within one minimum contract of the second apron?").

## Ingestion DAG (nightly + event-driven)

```
02:00  pull_stats        stats.nba.com (league-wide, residential proxy or licensed feed)
02:10  pull_contracts    licensed cap feed / scraped snapshots with provenance
02:20  pull_picks        pick ownership + protections
02:30  validate          zod/pydantic schemas + cross-source checks:
                         Σ player cap hits == published team total (to the dollar),
                         roster counts within bounds, pick years contiguous
02:40  load              upsert into Postgres inside one transaction per source
02:50  materialize       percentile views, cap-sheet snapshots, apron-distance table
03:00  diff + notify     Slack digest: figures that changed overnight, with sources
```

Failures stop the pipeline **before** load, exactly the posture the demo's
`validate-data` build gate takes. During the season, transaction events
(trade calls, signings) enqueue an immediate re-pull rather than waiting for
the nightly run.

## Serving

- Next.js app authenticates against the front-office SSO; API routes read
  Postgres through a read-replica.
- Trade validation remains synchronous and stateless: `POST /api/trade/validate`
  loads the two cap sheets and runs the engine: no writes, trivially cacheable.
- Shareable trade URLs become short-lived rows (`proposals`) so scouts can pass
  links around without 500-character query strings.
