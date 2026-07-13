# Data sources

Every constant and contract figure in this repo traces to an entry here.
Nothing is invented; where a value couldn't be sourced it is omitted and
listed under **Known gaps** below. `scripts/validate-data.ts` re-sums every
roster through the engine and fails the build if the seeded figures don't
match the source's published team total to the dollar.

**Seed date for all roster figures: 2026-07-13** (footer date). Rosters move
fast in July. Re-verify before relying on any figure.

## Source of record

Rosters were first seeded 2026-07-12 from Basketball-Reference team payroll
pages, then **re-seeded 2026-07-13 from Spotrac team cap tables** after
confirming B-R ("salaries are updated monthly") had not yet reflected the
July 12-13 wave of moves (Smart to HOU, the Reaves re-sign, the DeRozan
waiver, Randle to BKN, Harden and Green becoming unsigned free agents).
Cross-checks against news reports: [ESPN on Smart to HOU](https://www.espn.com/nba/story/_/id/49235334/sources-marcus-smart-agrees-2-year-13m-deal-rockets).

Per-team pages, all accessed **2026-07-13**, pattern
`https://www.spotrac.com/nba/<team-slug>/cap/_/year/2026`:
Kings, Cavaliers, Thunder, Knicks, Warriors, Lakers, Nets.

`publishedTotal` per file = Spotrac's **Active Roster Cap total plus Dead
Money total** for 2026-27. Validation recomputes it from the seeded players
and requires an exact match. All 7 teams re-sum exactly. Cap holds and
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

## Roster seeds (`/data/rosters/*.json`), all accessed 2026-07-13

### Sacramento Kings
- Published: Active $190,139,641 + Dead $10,000,000 (DeMar DeRozan, waived) = **$200,139,641** ✓ re-summed exactly. SAC sits $288,359 under the tax line.
- Spotrac flags SAC as **hard-capped at the first apron** (BAE used on Achiuwa). Pre-existing hard caps are not modeled in v1 (README known simplifications).
- Existing TPEs (Valanciunas, Saric, Carter trades) likewise documented-not-modeled.
- New since 7/12: DeRozan dead money, Dylan Cardwell signed. Departed active list: Emanuel Sharp (see Known gaps).
- Trade restrictions from signing dates: Achiuwa, Plowden, Cardwell (July FA signings) trade-eligible 2026-12-15; two-ways Flagler/Mogbo 30-day. LaVine exercised his option June 29, 2026 (no restriction; Spotrac's TYPE column shows "FA", read as original signing mechanism).

### Cleveland Cavaliers
- Published: Active $181,918,200 + Dead $424,672 (Ricky Rubio) = **$182,342,872** ✓ re-summed exactly. CLE fell below the tax line.
- **James Harden is an unsigned free agent** ($47.0M cap hold, excluded). His prior 26-27 salary was non-guaranteed.
- Thomas Bryant's cap hit is $2,449,421 on a $3,524,115 base (10+ year vet minimum; league reimburses the difference). Seeded at cap hit.
- Craig Porter Jr. 2026-27 is non-guaranteed (guarantee date 1/10/2027).
- Departed active list: Meleek Thomas (see Known gaps). Two-ways now Udeh, Minix, Enaruna (from Spotrac deadline rows; 30-day dates approximate).

### Oklahoma City Thunder
- Published: Active **$232,001,714** ✓ re-summed exactly. Above the second apron by $10.3M. The league's only second-apron team in the seeded set.
- Chet Holmgren and Jalen Williams: exactly 25% max ($41,240,250); out-years computed as the CBA-standard 8% raises (no published anchor; **display-only**).
- Dort's cap hit dropped to $17,722,222 ($1M moved to unlikely incentives, which don't count).
- Ajay Mitchell partially guaranteed ($1.5M of $2.85M).

### New York Knicks
- Published: Active **$218,412,232** ✓ re-summed exactly. Above the first apron, $3.3M below the second.
- KAT's 2027-28 player option is $62,062,000 per Spotrac deadlines (B-R had shown $61,015,192).
- Hart's 2027-28 ($22,375,280) is a club option per Spotrac (B-R showed plain salary).
- New: Jordan Clarkson (vet min). Shamet/Alvarado/Diawara re-signed on new deals; their 2027-28 figures aren't published on the accessed pages, so those single out-years are omitted (28-29 figures anchored by Spotrac guarantee-date values).

### Golden State Warriors
- Published: Active **$179,747,598** ✓ re-summed exactly. GSW fell under the tax.
- **Draymond Green is an unsigned free agent** ($38.8M Bird hold, excluded).
- Porziņģis renegotiated to a flat $20,000,000 (June 30 extension → six-month trade restriction, seeded to 2026-12-30). His new out-year isn't published; omitted.
- De'Anthony Melton appears only as a **pending** $5,477,000 transaction (BAE-sized); pending deals don't count and are excluded.
- Spotrac flags GSW as hard-capped at the **second** apron (not modeled in v1).
- New: Charles Bassey (vet min).

### Los Angeles Lakers
- Published: Active **$193,549,059** ✓ re-summed exactly. LAL jumped from under the cap to $28.6M over it, and Spotrac flags the roster as hard-capped at the first apron (Kessler sign-and-trade; not modeled in v1).
- **Austin Reaves re-signed at $41,240,250** (25% max). Out-years computed from equal 8% raises and confirmed exactly by Spotrac's published 2029-30 player-option figure ($51,137,910).
- Dončić's extension starts at $49,488,300 (exactly the 30% max; B-R's $49,800,000 was stale). 2027-28 computed by the same equal-raise arithmetic and confirmed exactly by the published 2028-29 option ($57,406,428).
- Kessler $30,108,821 with equal raises to the published 2029-30 option ($34,625,144): $1,505,441 per year, integer-exact.
- **Marcus Smart left for Houston** (2yr/$13M, ESPN) and is no longer seeded anywhere. New: Collin Sexton ($9,366,000). Kevon Looney is pending-only; excluded.
- Nick Smith Jr. no longer appears at all (previous Known gap resolved by departure).

### Brooklyn Nets
- Published: Active **$151,056,358** ✓ re-summed exactly. Above the floor now, still the only team with cap room (about $13.9M practical).
- **Julius Randle signed** ($33,333,334, 27-28 player option $35,802,468). **Nic Claxton, Ziaire Williams, and Malachi Smith are gone** (Claxton traded out of the seeded league).
- Michael Porter Jr. is now fully guaranteed. Keon Ellis re-signed at a flat $9,000,000 with a 27-28 player option.
- New rookie Joshua Jefferson; his 2027-28 figure isn't published (28-29 club option anchored at $3,266,880); omitted.
- Two-ways: Bilodeau, Chaney Johnson.

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

- **Emanuel Sharp (SAC)** and **Meleek Thomas (CLE)**: present in Spotrac's
  deadline data but absent from the active-roster tables on access date
  (possibly waived or converted; both were sub-$1.4M deals). Omitted pending
  clarity rather than guessed.
- **James Harden (CLE)** and **Draymond Green (GSW)**: unsigned free agents
  (cap holds only). Not seeded; holds aren't modeled.
- **De'Anthony Melton (GSW)** and **Kevon Looney (LAL)**: pending, unofficial
  transactions on access date. Excluded until official.
- Out-year figures for a handful of new July deals (Shamet, Alvarado, Diawara
  27-28; Porziņģis, Jefferson 27-28; Sexton beyond 26-27) aren't published on
  the accessed pages and are omitted, per team notes above. Where an out-year
  IS seeded for a new deal, it's either Spotrac's published option/guarantee
  figure or equal-raise arithmetic exactly confirmed by one (LAL notes).
- Out-years for Chet Holmgren / Jalen Williams maxes: standard 8% raises,
  display-only, no anchor published.
- nba.com person ids seeded only where confidently known; others use stable
  slugs. The ETL joins stats by normalized name.
