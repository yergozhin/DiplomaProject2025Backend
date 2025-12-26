export interface OfferResponse {
  id: string;
  offerId: string;
  fighterId: string;
  fighterName: string | null;
  amount: number;
  currency: string;
  status: 'pending' | 'accepted' | 'rejected';
  respondedAt: string | null;
}

export interface CreateResponseFields {
  offerId: string;
  fighterId: string;
  amount: number;
  currency?: string;
  status?: 'pending' | 'accepted' | 'rejected';
}

export interface UpdateResponseFields {
  amount?: number;
  currency?: string;
  status?: 'pending' | 'accepted' | 'rejected';
}

