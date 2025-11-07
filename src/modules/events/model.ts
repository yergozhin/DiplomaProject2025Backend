export interface Event {
  id: string;
  name: string;
  ploId: string;
  createdAt: string;
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


