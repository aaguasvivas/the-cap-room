# Data sources

Every constant and contract figure in this repo traces to an entry here.
Nothing is invented; where a value couldn't be sourced it is omitted and
listed under **Known gaps** below. `scripts/validate-data.ts` re-sums every
roster through the engine and fails the build if the seeded figures don't
match the source's published team total to the dollar.

**Seed date for all roster figures: 2026-08-04** (footer date). Offseason
rosters move fast. Re-verify before relying on any figure.

## Source of record

Rosters were first seeded 2026-07-12 from Basketball-Reference, re-seeded
2026-07-13 from Spotrac after B-R's monthly cadence missed the July wave, and
**re-seeded again 2026-08-04 from Spotrac** ahead of sharing: Draymond Green
and De'Anthony Melton re-signed with GSW, Dort was traded out of OKC, LAL
added Ziaire Williams/Thybulle/Looney (16-man offseason roster), BKN added
Moritz Wagner, CLE added Hezonja, and Sharp (SAC) and Thomas (CLE) returned
to Spotrac's active tables, resolving the July 13 known gap. Two teams were
added for coverage and star power: **Orlando** and **Philadelphia** (LeBron
James at the veteran minimum beside Embiid and Jaylen Brown). Notably, **no
seeded team sits above the second apron in August**: contenders shed salary
to duck it, which the league board makes visible.
Cross-checks against news reports: [ESPN on Smart to HOU](https://www.espn.com/nba/story/_/id/49235334/sources-marcus-smart-agrees-2-year-13m-deal-rockets).

Per-team pages, all accessed **2026-08-04**, pattern
`https://www.spotrac.com/nba/<team-slug>/cap/_/year/2026`:
Kings, Cavaliers, Thunder, Knicks, Warriors, Lakers, Nets, Magic, 76ers.

`publishedTotal` per file = Spotrac's **Active Roster Cap total plus Dead
Money total** for 2026-27. Validation recomputes it from the seeded players
and requires an exact match. All 9 teams re-sum exactly. Cap holds and
pending transactions are excluded (they are placeholders, not committed
salary), which mirrors the engine's counting rules.

## League constants (`engine/constants.ts`)

2026-27 league-year figures (set July 1, 2026), provided in the build spec and
cross-checked against both B-R and Spotrac page headers ($164,961,000 cap;
Spotrac shows the same $209,015,000 / $221,686,000 apron maxima):

| Constant | Value | Status |
|---|---|---|
| Salary cap | $164,961,000 | matches B-R and Spotrac, accessed 2026-07-13 |
| Minimum team salary (floor) | $148,465,000 | 90% of cap, per spec |
| Luxury tax line | $200,428,000 | per spec |
| First apron | $209,015,000 | matches Spotrac "1st Apron Maximum" |
| Second apron | $221,686,000 | matches Spotrac "2nd Apron Maximum" |
| Non-taxpayer MLE | $15,044,000 | matches Spotrac exceptions tables (SAC, GSW) |
| Taxpayer MLE | $6,064,000 | matches Spotrac exceptions table (NYK) |
| Room MLE | $9,366,000 | per spec; Spotrac lists $9,369,000 on LAL/BKN. **Verify which is official.** Collin Sexton's LAL deal is exactly $9,366,000 |
| Bi-annual exception | $5,477,000 | matches Spotrac: SAC's BAE shows used on Precious Achiuwa at exactly this figure |
| Expanded TPE adder | $9,096,000 | per spec |
| TPE buffer | $250,000 | 2023 CBA, Art. VII |
| Trade cash limit | $8,495,000 | per spec |
| Two-way salary | $678,882 | per spec; Spotrac lists two-way cap HOLDS at $2,185,116 (a different concept). Display-only, excluded from totals |
| MIN_ROOKIE / MIN_TWO_YR / MIN_VET | $1,350,000 / $2,440,000 / $3,870,000 | **approx, display-only; not used in any engine math.** Spotrac shows actual vet-min cap hits at $2,449,421 (e.g. Bryant, Drummond, Clarkson, Bassey) |

## Roster seeds (`/data/rosters/*.json`), all accessed 2026-08-04

### Sacramento Kings
- Published: Active $191,497,404 + Dead $10,000,000 (DeRozan) = **$201,497,404** ✓ re-summed exactly. SAC is now a **taxpayer**, $1,069,404 over the line, and Spotrac flags the hard cap at the first apron (BAE used on Achiuwa).
- Emanuel Sharp restored to the active table (July 13 gap resolved); out-years carried from the 7/12 B-R seed.
- Restrictions: Achiuwa, Plowden, Cardwell trade-eligible 2026-12-15. All 30-day rookie/two-way windows have lapsed.

### Cleveland Cavaliers
- Published: Active $185,725,384 + Dead $424,672 (Rubio) = **$186,150,056** ✓. Below the tax. Harden remains an unsigned $47.0M cap hold. Meleek Thomas restored; Mario Hezonja signed (vet min, Dec 15 restriction).

### Oklahoma City Thunder
- Published: Active **$214,279,492** ✓. **Dort traded out** of the seeded league; OKC dropped below the second apron and is now a first-apron team.

### New York Knicks
- Published: Active **$218,412,232** ✓, unchanged since 7/13. The league's closest team to the second apron ($3.3M under), which the "apron wall" scenario uses.

### Golden State Warriors
- Published: Active **$215,352,590** ✓. **Draymond Green re-signed** ($27,678,571) and **Melton's BAE deal is official** ($5,477,000); Gary Payton II added. GSW is a first-apron team. Note: Spotrac's own apron math adds $500K of unlikely incentives; this repo counts cap hits.
- Bassey now partially guaranteed ($1.4M) → guaranteed: false.

### Los Angeles Lakers
- Published: Active **$200,897,322** ✓. LAL is a taxpayer by $469,322 and carries **16 standard contracts**, legal in the offseason (limit 21) but over the regular-season 15, which the engine now models. Added: Ziaire Williams, Matisse Thybulle, Kevon Looney (vet mins, Dec 15). Sexton's 27-28 player option published at $9,834,300. Two-ways now Mañon, Okereke, Kaluma (Suder off).

### Brooklyn Nets
- Published: Active **$160,324,651** ✓. Moritz Wagner signed ($9,268,293). Still the only under-cap team, now above the floor with a full 15.

### Orlando Magic (added 2026-08-04)
- Published: Active $209,865,321 + Dead $8,000,000 (Isaac, waived and re-signed at the minimum, both entries seeded) = **$217,865,321** ✓. First-apron team.
- New seed: out-years not yet captured for most contracts (single-year figures; the multi-year strip's committed-only caveat applies). FA signings carry Dec 15 restrictions inferred from the July signing window.

### Philadelphia 76ers (added 2026-08-04)
- Published: Active **$204,737,051** ✓. Taxpayer, hard-capped at the first apron per Spotrac (NT-MLE split across Wade and Simons, BAE on Hukporti).
- **LeBron James, age 42, on a veteran minimum** ($3,876,529 cap hit as listed), trade-restricted until Dec 15 like every July signee, which makes for an excellent ledger demonstration.
- Jaylen Brown's cap hit ($57,736,350) exceeds his base salary per Spotrac (trade-bonus proration from the Boston trade); the cap hit is seeded. Same single-year caveat as ORL.

## Sacramento Kings draft picks (`/data/picks/SAC.json`)

Confirmed on Spotrac's SAC page (Future Draft Picks section, accessed
2026-07-13), consistent with RealGM/ProSportsTransactions from the 7/12 seed:
- SAC owns its 2027-2030, 2032, 2033 firsts. **The 2027 first is owed to OKC
  only if it lands 17-30** (Nique Clifford draft trade); modeled as owned with
  the protection noted, since SAC picks in 2027 either way if it conveys later.
- 2031 first is swap-encumbered to San Antonio (unprotected swap, Fox trade).
- Incoming firsts (SAS-conditional 2027, MIN 2031) are noted but not modeled;
  v1 pick chips cover a team's own firsts only.

## Stats (`/data/stats/players-2025-26.json`)

Produced by `etl/pull_stats.py` against stats.nba.com (league-wide, 2025-26
regular season), pulled 2026-07-12. The committed JSON is the snapshot the
app reads; the deployed demo makes zero runtime calls to stats.nba.com (it
blocks cloud-provider IPs). New July signees who changed teams keep their
2025-26 stat rows under their prior team code; the app joins by player name.

## Known gaps (surfaced as unknown, never invented)

- **James Harden (CLE)**: still an unsigned free agent ($47.0M cap hold).
  Not seeded; holds aren't modeled. (July 13 gaps for Sharp, Thomas, Melton,
  and Looney all resolved on 2026-08-04: the first two returned to the active
  tables, the latter two signed.)
- **ORL and PHI out-years**: mostly single-year seeds on their add date; see
  team notes.
- Out-year figures for a handful of new July deals (Shamet, Alvarado, Diawara
  27-28; Porziņģis, Jefferson 27-28; Sexton beyond 26-27) aren't published on
  the accessed pages and are omitted, per team notes above. Where an out-year
  IS seeded for a new deal, it's either Spotrac's published option/guarantee
  figure or equal-raise arithmetic exactly confirmed by one (LAL notes).
- Out-years for Chet Holmgren / Jalen Williams maxes: standard 8% raises,
  display-only, no anchor published.
- nba.com person ids seeded only where confidently known; others use stable
  slugs. The ETL joins stats by normalized name.
