import * as repo from './repo';
import * as historyRepo from '../fight-history/repo';
import * as medicalClearancesRepo from '../medical-clearances/repo';

export const list = () => repo.all();

export async function sendOffers(ploId: string, fightId: string, eventId: string, eventSlotId: string, fighterAAmount: number, fighterACurrency: string, fighterBAmount: number, fighterBCurrency: string) {
  if (!ploId || !fightId || !eventId || !eventSlotId) {
    return { error: 'missing_required_fields' };
  }
  if (fighterAAmount < 0 || fighterBAmount < 0) {
    return { error: 'invalid_amount' };
  }
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
    for (const offer of existingOffers) {
      if (offer.status === 'pending') {
        return { error: 'offer_already_exists' };
      }
    }
    if (existingOffers.length === 2) {
      let allAccepted = true;
      for (const offer of existingOffers) {
        if (offer.status !== 'accepted') {
          allAccepted = false;
          break;
        }
      }
      if (allAccepted) {
        return { error: 'offers_already_accepted' };
      }
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

export const getAvailableByFighterId = (fighterId: string) => {
  return repo.getAvailableByFighterId(fighterId);
};

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
    const slotDate = slot.startTime ? new Date(slot.startTime) : new Date();
    const dateStr = slotDate.toISOString();
    const fightDate = new Date(dateStr.split('T')[0]);
    
    let hasValidClearance = false;
    for (const c of fighterClearances) {
      if (c.status === 'approved') {
        if (!c.expirationDate) {
          hasValidClearance = true;
          break;
        }
        if (new Date(c.expirationDate) >= fightDate) {
          hasValidClearance = true;
          break;
        }
      }
    }
    if (!hasValidClearance) {
      return { error: 'medical_clearance_missing_or_expired' };
    }
  }
  const updated = await repo.updateStatus(offerId, fighterId, status);
  if (updated && status === 'accepted') {
    const offers = await repo.getOffersForFightEventSlot(offer.fightId, offer.eventId, offer.eventSlotId, offer.ploId);
    if (offers.length === 2) {
      let allAccepted = true;
      for (const offer of offers) {
        if (offer.status !== 'accepted') {
          allAccepted = false;
          break;
        }
      }
      if (allAccepted) {
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
        const slotDate = slot.startTime ? new Date(slot.startTime) : new Date();
        const fightDate = new Date(slotDate.toISOString().split('T')[0]);
      
        let fighterAHasValidClearance = false;
        for (const c of fighterAClearances) {
          if (c.status === 'approved') {
            if (!c.expirationDate) {
              fighterAHasValidClearance = true;
              break;
            }
            if (new Date(c.expirationDate) >= fightDate) {
              fighterAHasValidClearance = true;
              break;
            }
          }
        }
      
        let fighterBHasValidClearance = false;
        for (const c of fighterBClearances) {
          if (c.status === 'approved') {
            if (!c.expirationDate) {
              fighterBHasValidClearance = true;
              break;
            }
            if (new Date(c.expirationDate) >= fightDate) {
              fighterBHasValidClearance = true;
              break;
            }
          }
        }
      
        if (fighterAHasValidClearance && fighterBHasValidClearance) {
          await repo.updateFightStatus(offer.fightId, 'scheduled');
          await historyRepo.create({
            fightId: offer.fightId,
            status: 'scheduled',
            changedBy: offer.ploId,
            changeReason: 'Both fighters accepted offers for event slot',
          });
          await repo.updateEventSlotFight(offer.eventSlotId, offer.fightId);
          await repo.rejectPendingOffersForEventSlot(offer.eventSlotId, offer.fightId);
        }
      }
    }
  }
  return { offer: updated };
}


