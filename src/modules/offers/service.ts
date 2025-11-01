import * as repo from './repo';

export function list() {
  return repo.all();
}

export async function sendOffers(ploId: string, fightId: string, eventId: string, eventSlotId: string) {
  const fight = await repo.getFightById(fightId);
  if (!fight) {
    return { error: 'fight_not_found' };
  }
  if (fight.status !== 'accepted') {
    return { error: 'fight_not_accepted' };
  }
  const event = await repo.getEventById(eventId);
  if (!event) {
    return { error: 'event_not_found' };
  }
  if (event.ploId !== ploId) {
    return { error: 'event_not_owned' };
  }
  const slot = await repo.getEventSlotById(eventSlotId);
  if (!slot) {
    return { error: 'slot_not_found' };
  }
  if (slot.eventId !== eventId) {
    return { error: 'slot_not_in_event' };
  }
  if (slot.fightId !== null) {
    return { error: 'slot_already_assigned' };
  }
  const offerA = await repo.create(fightId, eventId, eventSlotId, fight.fighterAId, ploId);
  const offerB = await repo.create(fightId, eventId, eventSlotId, fight.fighterBId, ploId);
  return { offers: [offerA, offerB] };
}


