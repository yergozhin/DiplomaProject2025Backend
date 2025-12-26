export interface FightContract {
  id: string;
  fightId: string;
  fighterId: string;
  fighterName: string | null;
  contractAmount: number;
  currency: string;
  contractSigned: boolean;
  contractSignedAt: string | null;
  contractTerms: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContractFields {
  fightId: string;
  fighterId: string;
  contractAmount: number;
  currency?: string;
  contractTerms?: string | null;
}

export interface UpdateContractFields {
  contractAmount?: number;
  currency?: string;
  contractSigned?: boolean;
  contractTerms?: string | null;
}

