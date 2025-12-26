import * as repo from './repo';
import type { EventSponsor, CreateSponsorFields, UpdateSponsorFields } from './model';

export function create(fields: CreateSponsorFields) {
  return repo.create(fields);
}

export function getByEventId(eventId: string) {
  return repo.getByEventId(eventId);
}

export function getById(id: string) {
  return repo.getById(id);
}

export function update(id: string, fields: UpdateSponsorFields) {
  return repo.update(id, fields);
}

export function deleteById(id: string) {
  return repo.deleteById(id);
}

