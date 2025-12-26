export interface FightResult {
  id: string;
  fightId: string;
  winnerId: string | null;
  winnerName: string | null;
  resultType: 'knockout' | 'technical_knockout' | 'submission' | 'decision' | 'draw' | 'no_contest' | 'disqualification' | null;
  roundEnded: number | null;
  timeEnded: string | null;
  judgeScores: Record<string, unknown> | null;
}

export interface CreateResultFields {
  fightId: string;
  winnerId?: string | null;
  resultType?: 'knockout' | 'technical_knockout' | 'submission' | 'decision' | 'draw' | 'no_contest' | 'disqualification' | null;
  roundEnded?: number | null;
  timeEnded?: string | null;
  judgeScores?: Record<string, unknown> | null;
}

export interface UpdateResultFields {
  winnerId?: string | null;
  resultType?: 'knockout' | 'technical_knockout' | 'submission' | 'decision' | 'draw' | 'no_contest' | 'disqualification' | null;
  roundEnded?: number | null;
  timeEnded?: string | null;
  judgeScores?: Record<string, unknown> | null;
}

