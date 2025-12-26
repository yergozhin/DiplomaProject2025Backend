export interface EventLocation {
  id: string;
  eventId: string;
  venueName: string | null;
  venueAddress: string | null;
  city: string | null;
  country: string | null;
  venueCapacity: number | null;
  updatedAt: string;
}

export interface CreateLocationFields {
  eventId: string;
  venueName?: string | null;
  venueAddress?: string | null;
  city?: string | null;
  country?: string | null;
  venueCapacity?: number | null;
}

export interface UpdateLocationFields {
  venueName?: string | null;
  venueAddress?: string | null;
  city?: string | null;
  country?: string | null;
  venueCapacity?: number | null;
}

