export interface EventSponsor {
  id: string;
  eventId: string;
  sponsorName: string;
  sponsorLogo: string | null;
  sponsorshipLevel: 'platinum' | 'gold' | 'silver' | 'bronze' | null;
  sponsorshipAmount: number | null;
}

export interface CreateSponsorFields {
  eventId: string;
  sponsorName: string;
  sponsorLogo?: string | null;
  sponsorshipLevel?: 'platinum' | 'gold' | 'silver' | 'bronze' | null;
  sponsorshipAmount?: number | null;
}

export interface UpdateSponsorFields {
  sponsorName?: string;
  sponsorLogo?: string | null;
  sponsorshipLevel?: 'platinum' | 'gold' | 'silver' | 'bronze' | null;
  sponsorshipAmount?: number | null;
}

