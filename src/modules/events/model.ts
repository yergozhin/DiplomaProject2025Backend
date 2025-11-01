export type Event = {
  id: string;
  name: string;
  ploId: string;
  createdAt: string;
};

export type EventSlot = {
  id: string;
  eventId: string;
  startTime: string;
  fightId: string | null;
};


