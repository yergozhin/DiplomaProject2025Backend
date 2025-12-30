export interface FighterRanking {
  id: string;
  fighterId: string;
  weightClassId: string;
  weightClassName: string | null;
  rankingPosition: number | null;
  rankingPoints: number;
  rankingDate: string;
  fighterName?: string;
  fighterEmail?: string;
  wins?: number;
  losses?: number;
  draws?: number;
  totalFights?: number;
}

export interface CreateRankingFields {
  fighterId: string;
  weightClassId: string;
  rankingPosition: number | null;
  rankingPoints: number;
  rankingDate: string;
}

export interface UpdateRankingFields {
  rankingPosition?: number | null;
  rankingPoints?: number;
  rankingDate?: string;
}

