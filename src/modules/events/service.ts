import * as repo from './repo';
import { EventSlot } from './model';

export function list() {
  return repo.all();
}

export async function createEvent(ploId: string, name: string, slots: string[]) {
  const event = await repo.create(ploId, name);
  const createdSlots: EventSlot[] = [];
  for (const startTime of slots) {
    const slot = await repo.addSlot(event.id, startTime);
    createdSlots.push(slot);
  }
  return { ...event, slots: createdSlots };
}

export function getByPloId(ploId: string) {
  return repo.getByPloId(ploId);
}

export async function getAvailableSlotsForEvent(eventId: string, ploId: string) {
  const event = await repo.getById(eventId);
  if (!event) {
    return { error: 'event_not_found' };
  }
  if (event.ploId !== ploId) {
    return { error: 'event_not_owned' };
  }
  return repo.getAvailableSlots(eventId);
}


