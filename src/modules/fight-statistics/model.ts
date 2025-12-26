export interface FightStatistic {
  id: string;
  fightId: string;
  fighterId: string;
  fighterName: string | null;
  strikesLanded: number;
  strikesAttempted: number;
  takedownsLanded: number;
  takedownsAttempted: number;
  submissionAttempts: number;
  controlTimeSeconds: number;
}

export interface CreateStatisticFields {
  fightId: string;
  fighterId: string;
  strikesLanded?: number;
  strikesAttempted?: number;
  takedownsLanded?: number;
  takedownsAttempted?: number;
  submissionAttempts?: number;
  controlTimeSeconds?: number;
}

export interface UpdateStatisticFields {
  strikesLanded?: number;
  strikesAttempted?: number;
  takedownsLanded?: number;
  takedownsAttempted?: number;
  submissionAttempts?: number;
  controlTimeSeconds?: number;
}

