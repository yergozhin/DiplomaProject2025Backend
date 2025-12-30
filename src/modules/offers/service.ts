import * as repo from './repo';
import * as historyRepo from '../fight-history/repo';
import * as medicalClearancesRepo from '../medical-clearances/repo';

export function list() {
  return repo.all();
}

export async function sendOffers(ploId: string, fightId: string, eventId: string, eventSlotId: string, fighterAAmount: number, fighterACurrency: string, fighterBAmount: number, fighterBCurrency: string) {
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
  const existingOffers = await repo.getOffersForFightEventSlotPlo(fightId, eventId, eventSlotId, ploId);
  if (existingOffers.length > 0) {
    const hasPending = existingOffers.some(o => o.status === 'pending');
    if (hasPending) {
      return { error: 'offer_already_exists' };
    }
    const hasBothAccepted = existingOffers.length === 2 && existingOffers.every(o => o.status === 'accepted');
    if (hasBothAccepted) {
      return { error: 'offers_already_accepted' };
    }
  }
  const offerA = await repo.create(fightId, eventId, eventSlotId, fight.fighterAId, ploId, fighterAAmount, fighterACurrency);
  const offerB = await repo.create(fightId, eventId, eventSlotId, fight.fighterBId, ploId, fighterBAmount, fighterBCurrency);
  return { offers: [offerA, offerB] };
}

export async function deleteOffer(ploId: string, fightId: string) {
  const existing = await repo.findExistingOffer(fightId, ploId);
  if (!existing) {
    return { error: 'offer_not_found' };
  }
  await repo.deleteByFightAndPlo(fightId, ploId);
  return { success: true };
}

export function getAvailableByFighterId(fighterId: string) {
  return repo.getAvailableByFighterId(fighterId);
}

export function getAvailableOffersForFightByFighter(fightId: string, fighterId: string) {
  return repo.getAvailableOffersForFightByFighter(fightId, fighterId);
}

export async function updateOfferStatus(fighterId: string, offerId: string, status: 'accepted' | 'rejected') {
  const offer = await repo.getById(offerId);
  if (!offer) {
    return { error: 'offer_not_found' };
  }
  if (offer.fighterId !== fighterId) {
    return { error: 'forbidden' };
  }
  if (offer.status !== 'pending') {
    return { error: 'offer_already_responded' };
  }
  if (status === 'accepted') {
    const fight = await repo.getFightById(offer.fightId);
    if (!fight) {
      return { error: 'fight_not_found' };
    }
    const slot = await repo.getEventSlotById(offer.eventSlotId);
    if (!slot) {
      return { error: 'slot_not_found' };
    }
    const fighterClearances = await medicalClearancesRepo.getByFighterId(fighterId);
    const fightDateStr = slot.startTime ? new Date(slot.startTime).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    const fightDate = new Date(fightDateStr);
    const hasValidClearance = fighterClearances.some(c => {
      if (c.status !== 'approved') return false;
      if (!c.expirationDate) return true;
      const expirationDate = new Date(c.expirationDate);
      return expirationDate >= fightDate;
    });
    if (!hasValidClearance) {
      return { error: 'medical_clearance_missing_or_expired' };
    }
  }
  const updated = await repo.updateStatus(offerId, fighterId, status);
  if (updated && status === 'accepted') {
    const offers = await repo.getOffersForFightEventSlot(offer.fightId, offer.eventId, offer.eventSlotId, offer.ploId);
    if (offers.length === 2 && offers.every(o => o.status === 'accepted')) {
      const fight = await repo.getFightById(offer.fightId);
      if (!fight) {
        return { error: 'fight_not_found' };
      }
      const slot = await repo.getEventSlotById(offer.eventSlotId);
      if (!slot) {
        return { error: 'slot_not_found' };
      }
      const fighterAClearances = await medicalClearancesRepo.getByFighterId(fight.fighterAId);
      const fighterBClearances = await medicalClearancesRepo.getByFighterId(fight.fighterBId);
      const fightDateStr = slot.startTime ? new Date(slot.startTime).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      const fightDate = new Date(fightDateStr);
      const fighterAHasValidClearance = fighterAClearances.some(c => {
        if (c.status !== 'approved') return false;
        if (!c.expirationDate) return true;
        const expirationDate = new Date(c.expirationDate);
        return expirationDate >= fightDate;
      });
      const fighterBHasValidClearance = fighterBClearances.some(c => {
        if (c.status !== 'approved') return false;
        if (!c.expirationDate) return true;
        const expirationDate = new Date(c.expirationDate);
        return expirationDate >= fightDate;
      });
      if (fighterAHasValidClearance && fighterBHasValidClearance) {
        await repo.updateFightStatus(offer.fightId, 'scheduled');
        await historyRepo.create({
          fightId: offer.fightId,
          status: 'scheduled',
          changedBy: offer.ploId,
          changeReason: `Both fighters accepted offers for event slot`,
        });
        await repo.updateEventSlotFight(offer.eventSlotId, offer.fightId);
        await repo.rejectPendingOffersForEventSlot(offer.eventSlotId, offer.fightId);
      }
    }
  }
  return { offer: updated };
}


