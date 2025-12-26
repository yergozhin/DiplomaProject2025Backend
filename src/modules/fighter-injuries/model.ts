export interface FighterInjury {
  id: string;
  fighterId: string;
  injuryType: string;
  injuryDescription: string | null;
  injuryDate: string | null;
  recoveryStatus: 'recovering' | 'cleared' | 'ongoing' | null;
  medicalNotes: string | null;
  updatedAt: string;
}

export interface CreateInjuryFields {
  fighterId: string;
  injuryType: string;
  injuryDescription?: string | null;
  injuryDate?: string | null;
  recoveryStatus?: 'recovering' | 'cleared' | 'ongoing' | null;
  medicalNotes?: string | null;
}

export interface UpdateInjuryFields {
  injuryType?: string;
  injuryDescription?: string | null;
  injuryDate?: string | null;
  recoveryStatus?: 'recovering' | 'cleared' | 'ongoing' | null;
  medicalNotes?: string | null;
}

