export interface MedicalClearance {
  id: string;
  fighterId: string;
  clearanceDate: string;
  expirationDate: string | null;
  clearedBy: string | null;
  clearanceType: 'pre-fight' | 'post-fight' | 'annual' | 'emergency' | null;
  notes: string | null;
}

export interface CreateClearanceFields {
  fighterId: string;
  clearanceDate: string;
  expirationDate?: string | null;
  clearedBy?: string | null;
  clearanceType?: 'pre-fight' | 'post-fight' | 'annual' | 'emergency' | null;
  notes?: string | null;
}

export interface UpdateClearanceFields {
  clearanceDate?: string;
  expirationDate?: string | null;
  clearedBy?: string | null;
  clearanceType?: 'pre-fight' | 'post-fight' | 'annual' | 'emergency' | null;
  notes?: string | null;
}

