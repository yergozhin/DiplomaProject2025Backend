import * as repo from './repo';
import { EventSlot, Event } from './model';
import type { EventUpdateFields } from './repo';
import * as eventStatusHistoryRepo from '@src/modules/event-status-history/repo';

export async function list() {
  const events = await repo.all();
  
  for (const event of events) {
    await repo.updateEventStatusIfNeeded(event.id);
  }
  
  return repo.all();
}

export async function listPublished() {
  const events = await repo.getPublished();
  for (const event of events) {
    await repo.updateEventStatusIfNeeded(event.id);
  }
  return repo.getPublished();
}

export async function createEvent(ploId: string, name: string, slots: string[]) {
  if (!ploId || !name || name.trim() === '') {
    throw new Error('PLO ID and event name are required');
  }
  if (!slots || slots.length === 0) {
    throw new Error('At least one time slot is required');
  }
  
  const event = await repo.create(ploId, name);
  
  await eventStatusHistoryRepo.create({
    eventId: event.id,
    status: 'draft',
    changedBy: ploId,
    changeReason: 'Event created',
  });
  
  const createdSlots: EventSlot[] = [];
  for (const slotTime of slots) {
    const slot = await repo.addSlot(event.id, slotTime);
    createdSlots.push(slot);
  }
  
  return { ...event, slots: createdSlots };
}

export async function getByPloId(ploId: string) {
  const events = await repo.getByPloId(ploId);
  
  for (const event of events) {
    await repo.updateEventStatusIfNeeded(event.id);
  }
  
  return repo.getByPloId(ploId);
}

export async function getAvailableSlotsForEvent(eventId: string, ploId: string) {
  if (!eventId || !ploId) {
    return { error: 'event_not_found' };
  }
  
  const event = await repo.getById(eventId);
  if (!event) {
    return { error: 'event_not_found' };
  }
  if (event.ploId !== ploId) {
    return { error: 'event_not_owned' };
  }
  
  return repo.getAvailableSlots(eventId);
}

export async function getAllSlotsForEvent(eventId: string) {
  if (!eventId) {
    return { error: 'event_not_found' };
  }
  
  const event = await repo.getById(eventId);
  if (!event) {
    return { error: 'event_not_found' };
  }
  
  if (event.status !== 'published') {
    return { error: 'event_not_published' };
  }
  
  return repo.getAllSlots(eventId);
}

export const updateEvent = async (eventId: string, ploId: string, fields: EventUpdateFields) => {
  if (!eventId || !ploId) throw new Error('Event ID and PLO ID required');
  return repo.updateEvent(eventId, ploId, fields);
};

type PublishEventError = 'not_found' | 'invalid_status' | 'missing_required_fields' | 'no_slots';

export async function publishEvent(
  eventId: string,
  ploId: string,
): Promise<{ event: Event | null, error?: PublishEventError }> {
  const event = await repo.getByIdAndPloId(eventId, ploId);
  if (!event) {
    return { event: null, error: 'not_found' };
  }

  if (event.status !== 'draft') {
    return { event: null, error: 'invalid_status' };
  }

  const requiredFields = [event.venueName, event.venueAddress, event.city, event.country, event.posterImage, event.ticketLink];
  
  let hasEmptyField = false;
  for (const field of requiredFields) {
    if (!field?.trim()) {
      hasEmptyField = true;
      break;
    }
  }
  if (hasEmptyField) {
    return { event: null, error: 'missing_required_fields' };
  }
  
  if (!event.venueCapacity || event.venueCapacity <= 0) {
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

export const getFightsForEvent = (eventId: string) => {
  return repo.getFightsForEvent(eventId);
};

export async function getPublicFightsForEvent(eventId: string) {
  if (!eventId) {
    return { error: 'event_not_found' };
  }
  
  const event = await repo.getById(eventId);
  if (!event) {
    return { error: 'event_not_found' };
  }
  
  if (event.status !== 'published') {
    return { error: 'event_not_published' };
  }
  
  return repo.getFightsForEvent(eventId);
}

export async function checkAndUpdateEventStatus(eventId: string) {
  return repo.updateEventStatusIfNeeded(eventId);
}


