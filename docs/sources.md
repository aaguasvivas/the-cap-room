# Data sources

Every constant and contract figure in this repo traces to an entry here.
Nothing is invented; where a value couldn't be sourced it is omitted and
listed under **Known gaps** below. `scripts/validate-data.ts` re-sums every
roster through the engine and fails the build if the seeded figures don't
match the source's published team total to the dollar.

**Seed date for all roster figures: 2026-07-12** (footer date). Rosters move
fast in July. Re-verify before relying on any figure.

## League constants (`engine/constants.ts`)

2026-27 league-year figures (set July 1, 2026), provided in the build spec and
cross-checked against Basketball-Reference's contracts pages, which display
"2026-27 Salary Cap: $164,961,000" (accessed 2026-07-12):

| Constant | Value | Status |
|---|---|---|
| Salary cap | $164,961,000 | matches B-R header, accessed 2026-07-12 |
| Minimum team salary (floor) | $148,465,000 | 90% of cap, per spec |
| Luxury tax line | $200,428,000 | per spec |
| First apron | $209,015,000 | per spec |
| Second apron | $221,686,000 | per spec |
| Non-taxpayer MLE | $15,044,000 | per spec |
| Taxpayer MLE | $6,064,000 | per spec |
| Room MLE | $9,366,000 | per spec |
| Bi-annual exception | $5,477,000 | per spec. Note: Precious Achiuwa's SAC deal is exactly this figure, consistent with a BAE signing |
| Expanded TPE adder | $9,096,000 | per spec |
| TPE buffer | $250,000 | 2023 CBA, Art. VII |
| Trade cash limit | $8,495,000 | per spec |
| Two-way salary | $678,882 | per spec; B-R leaves two-way salary cells blank. **Verify** |
| MIN_ROOKIE / MIN_TWO_YR / MIN_VET | $1,350,000 / $2,440,000 / $3,870,000 | **approx, display-only; not used in any engine math.** B-R shows actual 2026-27 minimum-contract cap hits in the $2.15M–$2.45M range (e.g. Bryant/Drummond at $2,449,421). Reconcile before using these constants anywhere |

## Roster seeds (`/data/rosters/*.json`)

All contract figures, ages, option years, and guarantee flags transcribed from
Basketball-Reference team payroll pages, accessed **2026-07-12**. Every file's
`publishedTotal` is the team-total row from the same page; validation
re-computes it from the seeded players and requires an exact match.

### Sacramento Kings
- URL: https://www.basketball-reference.com/contracts/SAC.html (accessed 2026-07-12)
- Published 2026-27 total: $189,346,486 ✓ re-summed exactly
- Trade restrictions seeded from the page's signing dates: Achiuwa (2yr/$11M, Jul 7 2026) and Plowden (2yr/$5M, Jul 2 2026) are offseason free-agent signings → trade-eligible Dec 15, 2026. Acuff Jr. / Karaban / Sharp signed rookie deals Jul 1, 2026 → 30-day restriction (Jul 31, 2026). Two-ways Flagler (Jul 1) / Mogbo (Jul 2) → 30-day restriction.
- LaVine's 2026-27 player option was exercised June 29, 2026 (per page notes); seeded as plain salary, no live option.

### Cleveland Cavaliers
- URL: https://www.basketball-reference.com/contracts/CLE.html (accessed 2026-07-12)
- Published 2026-27 total: $226,017,942 ✓ re-summed exactly (includes Ricky Rubio $424,672 dead money, seeded as `contractType: "dead"`)
- James Harden's $42,317,307 shows an empty Guaranteed cell on B-R → seeded `guaranteed: false`. **Verify** the actual guarantee structure.
- Restrictions: Bryant (min, Jul 7 2026) → Dec 15; Meleek Thomas (Jul 1 2026 draftee) and Udeh (two-way, Jul 1) → Jul 31.

### Oklahoma City Thunder
- URL: https://www.basketball-reference.com/contracts/OKC.html (accessed 2026-07-12)
- Published 2026-27 total: $233,021,214 ✓ re-summed exactly. (B-R's league summary page shows $235,184,214 for OKC; the team page's own total row is used; the summary likely includes cap holds.)
- Hartenstein 2028-29 is listed as a **mutual** option; seeded as a player option (closest schema value).
- Restrictions: Hartenstein (3yr/$75M, Jul 6 2026) + Kenrich Williams (Jul 6) → Dec 15; Mara/Stirtz (Jul 3 2026 draftees) and all three two-ways (Jul 3) → Aug 2.

### New York Knicks
- URL: https://www.basketball-reference.com/contracts/NYK.html (accessed 2026-07-12)
- Published 2026-27 total: $215,499,335 ✓ re-summed exactly
- Restrictions: Shamet, Alvarado, Drummond, Diawara (all signed Jul 6, 2026) → Dec 15.

### Golden State Warriors
- URL: https://www.basketball-reference.com/contracts/GSW.html (accessed 2026-07-12)
- Published 2026-27 total: $207,940,722 ✓ re-summed exactly
- Draymond Green and De'Anthony Melton show empty Guaranteed cells → `guaranteed: false`.
- Porziņģis extended June 30, 2026 → six-month extension trade restriction, seeded as recently-signed with return date Dec 30, 2026.
- Restrictions: Horford (Jul 6 2026) → Dec 15; Lendeborg (Jul 1 2026 draftee) → Jul 31.

### Los Angeles Lakers
- URL: https://www.basketball-reference.com/contracts/LAL.html (accessed 2026-07-12)
- Published 2026-27 total: $163,667,732 ✓ re-summed exactly
- Kessler was acquired by sign-and-trade July 8, 2026 (4yr/$130M, same-day trade from UTA per page notes) → seeded recently-signed, Dec 15, 2026. Note: that S&T acquisition hard-caps LAL at the first apron for 2026-27. Pre-existing hard caps are NOT modeled in v1 (see README known simplifications).
- Reaves / Smart 2026-27 player options show empty Guaranteed cells → `guaranteed: false`; Bronny James and Ajay-style non-guarantees likewise per page.
- Restrictions: Grimes, Mamukelashvili (Jul 7 2026) → Dec 15; Carr (Jul 2 2026 draftee) → Aug 1; two-ways (Jul 3) → Aug 2.

### Brooklyn Nets
- URL: https://www.basketball-reference.com/contracts/BRK.html (accessed 2026-07-12)
- Published 2026-27 total: $146,082,636 ✓ re-summed exactly. Under the cap AND ~$2.4M below the salary floor as seeded
- Michael Porter Jr.: $40,806,150 with only $12,000,000 guaranteed → `guaranteed: false`. Ziaire Williams' 2026-27 team option is non-guaranteed → `guaranteed: false`.
- Keon Ellis' 2027-28 is a **mutual** option per B-R; seeded as player option (closest schema value).
- Restrictions: Sharpe, Ellis, Minott (Jul 6 2026) → Dec 15; Brown Jr. (Jul 2 2026 draftee) and Bilodeau (two-way, Jul 2) → Aug 1.

## Sacramento Kings draft picks (`/data/picks/SAC.json`)

Synthesized from RealGM's Kings future-drafts page, ProSportsTransactions, and
SI's Kings picks explainer (all accessed via web search 2026-07-12; RealGM
blocks direct fetches):
- https://basketball.realgm.com/nba/teams/Sacramento-Kings/25/draft-picks
- https://www.prosportstransactions.com/basketball/DraftTrades/Future/Kings.htm
- https://www.si.com/nba/kings/onsi/all-future-kings-draft-picks-swaps-protections-in-2026-2027-beyond

Seeded: SAC owns its 2027–2030 and 2032–2033 firsts; the 2031 first is
swap-encumbered to San Antonio (unprotected swap from the De'Aaron Fox trade,
Feb 2025). Incoming picks (MIN 2031 unprotected; conditional SAS 2027) are
noted here but not modeled; v1 pick chips cover a team's own firsts only.

## Stats (`/data/stats/players-2025-26.json`)

Produced by `etl/pull_stats.py` against stats.nba.com (league-wide, 2025-26
regular season). The committed JSON is the snapshot the app reads; the
deployed demo makes zero runtime calls to stats.nba.com (it blocks
cloud-provider IPs). `pulledAt` inside the file records the pull time.

## Known gaps (surfaced as unknown, never invented)

- **Killian Hayes (SAC)**: B-R lists him with a non-guaranteed 2026-27 and no
  dollar figure; omitted from the seed until a figure is published.
- **Nick Smith Jr. (LAL)**: same: listed, no figure shown; omitted.
- Two-way cap figures: B-R leaves them blank; seeded at the spec's
  TWO_WAY_SALARY ($678,882), display-only in cap math (excluded from totals).
- nba.com person ids: seeded only where confidently known; other players use
  stable slugs (`sac-acuff`). The ETL joins stats by normalized name.
