import * as repo from './repo';
import type { OfferResponse, CreateResponseFields, UpdateResponseFields } from './model';

export function create(fields: CreateResponseFields) {
  return repo.create(fields);
}

export function getByOfferId(offerId: string) {
  return repo.getByOfferId(offerId);
}

export function getByFighterId(fighterId: string) {
  return repo.getByFighterId(fighterId);
}

export function getById(id: string) {
  return repo.getById(id);
}

export function update(id: string, fields: UpdateResponseFields) {
  return repo.update(id, fields);
}

export function deleteById(id: string) {
  return repo.deleteById(id);
}

