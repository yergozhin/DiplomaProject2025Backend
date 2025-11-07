export interface Fight {
  id: string;
  fighterAId: string;
  fighterBId: string;
  status: 'requested' | 'accepted' | 'scheduled' | 'deleted';
}

export interface FightRequestWithSender extends Fight {
  senderId: string;
  senderEmail: string;
  senderName: string | null;
  senderWeightClass: string | null;
}

export interface FightWithFighters extends Fight {
  fighterAUserId: string;
  fighterAEmail: string;
  fighterAName: string | null;
  fighterAWeightClass: string | null;
  fighterBUserId: string;
  fighterBEmail: string;
  fighterBName: string | null;
  fighterBWeightClass: string | null;
}


