#!/usr/bin/env python3
"""
Pull league-wide 2025-26 player stats from stats.nba.com into a committed
JSON snapshot (/data/stats/players-2025-26.json).

Why a local script instead of runtime calls: stats.nba.com blocks
cloud-provider IPs, so the deployed demo reads the committed snapshot and
makes zero runtime calls. Run this from a residential connection:

    python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
    .venv/bin/python pull_stats.py

League-wide on purpose: percentiles in the app are computed against the
actual league, not just the seeded teams.

Three requests total (one per stat table), with sleeps between calls and
an incremental temp-file write so a crash doesn't lose the run.
"""

from __future__ import annotations

import json
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

from nba_api.stats.endpoints import leaguedashplayerstats

SEASON = "2025-26"
OUT_PATH = Path(__file__).resolve().parent.parent / "data" / "stats" / f"players-{SEASON}.json"
TMP_PATH = OUT_PATH.with_suffix(".json.partial")
SLEEP_BETWEEN_CALLS = 2.0
RETRIES = 3
TIMEOUT = 90


def fetch(measure: str, per_mode: str) -> dict[str, list]:
    """One LeagueDashPlayerStats call → {header: column} keyed rows, with retry."""
    last_err: Exception | None = None
    for attempt in range(1, RETRIES + 1):
        try:
            print(f"  → LeagueDashPlayerStats measure={measure} per_mode={per_mode} (attempt {attempt})")
            resp = leaguedashplayerstats.LeagueDashPlayerStats(
                season=SEASON,
                season_type_all_star="Regular Season",
                measure_type_detailed_defense=measure,
                per_mode_detailed=per_mode,
                timeout=TIMEOUT,
            )
            data = resp.get_dict()["resultSets"][0]
            headers = data["headers"]
            rows = data["rowSet"]
            print(f"    ✓ {len(rows)} players")
            return {"headers": headers, "rows": rows}
        except Exception as e:  # noqa: BLE001, surface after retries
            last_err = e
            wait = 5 * attempt
            print(f"    ✗ {e}, retrying in {wait}s", file=sys.stderr)
            time.sleep(wait)
    raise RuntimeError(f"giving up on {measure}/{per_mode}: {last_err}")


def index_by_player(table: dict[str, list]) -> dict[int, dict]:
    h = table["headers"]
    return {row[h.index("PLAYER_ID")]: dict(zip(h, row)) for row in table["rows"]}


def rate(numer: float, denom: float) -> float | None:
    return round(numer / denom, 4) if denom else None


def main() -> None:
    print(f"Pulling {SEASON} league-wide player stats (3 requests)…")

    totals = fetch("Base", "Totals")
    _save_partial({"totals": True})
    time.sleep(SLEEP_BETWEEN_CALLS)

    per100 = fetch("Base", "Per100Possessions")
    _save_partial({"totals": True, "per100": True})
    time.sleep(SLEEP_BETWEEN_CALLS)

    advanced = fetch("Advanced", "PerGame")

    t_by, p_by, a_by = index_by_player(totals), index_by_player(per100), index_by_player(advanced)

    players = []
    for pid, t in t_by.items():
        p, a = p_by.get(pid), a_by.get(pid)
        if not p or not a:
            continue
        fga, fta, tov = t.get("FGA", 0) or 0, t.get("FTA", 0) or 0, t.get("TOV", 0) or 0
        players.append(
            {
                "playerId": str(pid),
                "name": t["PLAYER_NAME"],
                "team": t.get("TEAM_ABBREVIATION", ""),
                "gp": t.get("GP", 0),
                "min": round(t.get("MIN", 0) or 0),
                # per-75 possessions = per-100 × 0.75
                "ptsPer75": round((p.get("PTS") or 0) * 0.75, 1),
                "stlPer75": round((p.get("STL") or 0) * 0.75, 2),
                "blkPer75": round((p.get("BLK") or 0) * 0.75, 2),
                "ts": a.get("TS_PCT"),
                "usg": a.get("USG_PCT"),
                "astPct": a.get("AST_PCT"),
                "rebPct": a.get("REB_PCT"),
                # turnovers per play used: TOV / (FGA + 0.44·FTA + TOV)
                "tovPct": rate(tov, fga + 0.44 * fta + tov),
                "threePAr": rate(t.get("FG3A", 0) or 0, fga),
                "ftr": rate(fta, fga),
            }
        )

    players.sort(key=lambda r: -r["min"])
    out = {
        "season": SEASON,
        "pulledAt": datetime.now(timezone.utc).isoformat(),
        "source": "stats.nba.com via nba_api LeagueDashPlayerStats (Base Totals, Base Per100Possessions, Advanced PerGame)",
        "players": players,
    }
    OUT_PATH.write_text(json.dumps(out, indent=2) + "\n")
    TMP_PATH.unlink(missing_ok=True)
    print(f"✓ wrote {len(players)} players → {OUT_PATH}")


def _save_partial(progress: dict) -> None:
    TMP_PATH.write_text(json.dumps({"inProgress": progress, "at": datetime.now(timezone.utc).isoformat()}))


if __name__ == "__main__":
    main()
