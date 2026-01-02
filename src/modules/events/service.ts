import * as repo from './repo';
import { EventSlot, Event } from './model';
import type { EventUpdateFields } from './repo';
import * as eventStatusHistoryRepo from '@src/modules/event-status-history/repo';

export function list() {
  return repo.all();
}

export function listPublished() {
  return repo.getPublished();
}

export async function createEvent(ploId: string, name: string, slots: string[]) {
  const event = await repo.create(ploId, name);
  await eventStatusHistoryRepo.create({
    eventId: event.id,
    status: 'draft',
    changedBy: ploId,
    changeReason: 'Event created',
  });
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

export function updateEvent(eventId: string, ploId: string, fields: EventUpdateFields) {
  return repo.updateEvent(eventId, ploId, fields);
}

type PublishEventError = 'not_found' | 'invalid_status' | 'missing_required_fields' | 'no_slots';

export async function publishEvent(
  eventId: string,
  ploId: string,
): Promise<{ event: Event | null; error?: PublishEventError }> {
  const event = await repo.getByIdAndPloId(eventId, ploId);
  if (!event) {
    return { event: null, error: 'not_found' };
  }

  if (event.status !== 'draft') {
    return { event: null, error: 'invalid_status' };
  }

  const requiredFields = [
    event.venueName,
    event.venueAddress,
    event.city,
    event.country,
    event.venueCapacity,
    event.posterImage,
    event.ticketLink,
  ];

  const missing = requiredFields.some((value) => {
    if (value == null) return true;
    if (typeof value === 'number') return value <= 0;
    if (typeof value === 'string') return value.trim().length === 0;
    return false;
  });

  if (missing) {
    return { event: null, error: 'missing_required_fields' };
  }

  const slotCount = await repo.getSlotCount(eventId);
  if (slotCount === 0) {
    return { event: null, error: 'no_slots' };
  }

  const updated = await repo.updateEventStatus(eventId, ploId, 'published');
  if (updated) {
    await eventStatusHistoryRepo.create({
      eventId,
      status: 'published',
      changedBy: ploId,
      changeReason: null,
    });
  }
  return { event: updated };
}

export function getFightsForEvent(eventId: string) {
  return repo.getFightsForEvent(eventId);
}


