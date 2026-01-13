import * as repo from './repo';
import type { OfferResponse, CreateResponseFields, UpdateResponseFields } from './model';

export function create(fields: CreateResponseFields) {
  if (!fields.offerId) throw new Error('Offer ID required');
  if (!fields.fighterId) throw new Error('Fighter ID required');
  
  if (!fields.offerId || !fields.fighterId) {
    throw new Error('Offer ID and Fighter ID required');
  }
  
  return repo.create(fields);
}

export const getByOfferId = (offerId: string) => repo.getByOfferId(offerId);

export function getByFighterId(fighterId: string) {
  return repo.getByFighterId(fighterId);
}

export function getById(id: string) {
  return repo.getById(id);
}

export const update = async (id: string, fields: UpdateResponseFields) => {
  if (!id) throw new Error('ID required');
  return repo.update(id, fields);
};

export function remove(id: string) {
  return repo.deleteById(id);
}

