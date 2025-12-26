export interface FightHistory {
  id: string;
  fightId: string;
  status: string;
  changedBy: string | null;
  changedByName: string | null;
  changeReason: string | null;
  changedAt: string;
}

export interface CreateHistoryFields {
  fightId: string;
  status: string;
  changedBy?: string | null;
  changeReason?: string | null;
}

