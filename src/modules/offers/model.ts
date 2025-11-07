export type OfferStatus = 'pending' | 'accepted' | 'rejected';

export interface Offer {
  id: string;
  fightId: string;
  eventId: string;
  eventSlotId: string;
  fighterId: string;
  ploId: string;
  amount: number;
  currency: string;
  status: OfferStatus;
  createdAt: string;
}

export interface OfferWithFightDetails extends Offer {
  eventName: string;
  slotStartTime: string;
  ploEmail: string;
  fighterAId: string;
  fighterBId: string;
  fighterAStatus: OfferStatus;
  fighterBStatus: OfferStatus;
}

export interface OfferWithOverallStatus extends OfferWithFightDetails {
  overallStatus: OfferStatus;
}


