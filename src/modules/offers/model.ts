export type Offer = {
  id: string;
  fightId: string;
  eventId: string;
  eventSlotId: string;
  fighterId: string;
  ploId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
};


