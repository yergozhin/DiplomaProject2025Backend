export interface Fighter {
  id: string;
  email: string;
  name: string | null;
  weightClass: string | null;
  firstName: string | null;
  lastName: string | null;
  nickname: string | null;
  phoneNumber: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  currentWeightClass: string | null;
  height: number | null;
  reach: number | null;
  country: string | null;
  city: string | null;
  status: string | null;
  profilePicture: string | null;
  bio: string | null;
  profileCreatedAt: string | null;
  profileUpdatedAt: string | null;
  totalFights: number | null;
  wins: number | null;
  losses: number | null;
  draws: number | null;
  awards: string | null;
  recordConfirmed: boolean;
  recordConfirmedAt: string | null;
  recordConfirmedBy: string | null;
  recordAdminNotes: string | null;
}

export interface FighterVerification {
  id: string;
  fighterId: string;
  type: 'link' | 'contact' | 'image';
  value: string;
  wins: number;
  losses: number;
  draws: number;
  awards: string | null;
  status: 'pending' | 'accepted' | 'rejected';
  adminId: string | null;
  adminNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
}


