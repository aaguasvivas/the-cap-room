import type { ApronStatus, Player, TeamCapSheet, TeamCode, TeamPicks } from "@/engine/types";

/** Shapes returned by the app's own REST API (see README for curl examples). */

export interface TeamSummary {
  team: TeamCode;
  teamName: string;
  totalSalary: number;
  status: ApronStatus;
  statusLabel: string;
  standardCount: number;
  twoWayCount: number;
}

export interface TeamsResponse {
  leagueYear: string;
  seedDate: string;
  teams: TeamSummary[];
}

export type CapsheetResponse = TeamCapSheet & {
  teamName: string;
  asOf: string;
  statusLabel: string;
  picks: TeamPicks | null;
};

export type ApiPlayer = Player & { team: TeamCode; teamName: string };

export interface PlayersResponse {
  count: number;
  players: ApiPlayer[];
}
