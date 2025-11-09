export interface Event {
  id: string;
  name: string;
  ploId: string;
  createdAt: string;
  eventName: string | null;
  eventDescription: string | null;
  venueName: string | null;
  venueAddress: string | null;
  city: string | null;
  country: string | null;
  venueCapacity: number | null;
  posterImage: string | null;
  ticketLink: string | null;
  status: string | null;
  updatedAt: string | null;
}

export interface EventSlot {
  id: string;
  eventId: string;
  startTime: string;
  fightId: string | null;
}

export interface EventWithSlots extends Event {
  slots: EventSlot[];
}


