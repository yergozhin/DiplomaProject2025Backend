import * as repo from './repo';
import type { EventSponsor, CreateSponsorFields, UpdateSponsorFields } from './model';

export const create = async (fields: CreateSponsorFields) => {
  if (!fields.eventId) throw new Error('Event ID required');
  
  if (!fields.sponsorName || fields.sponsorName.trim() === '') {
    throw new Error('Sponsor name is required');
  }
  
  return repo.create(fields);
};

export function getByEventId(eventId: string) {
  return repo.getByEventId(eventId);
}

export const getById = (id: string) => repo.getById(id);

export function update(id: string, fields: UpdateSponsorFields) {
  if (!id) throw new Error('ID required');
  
  return repo.update(id, fields);
}

export function remove(id: string) {
  return repo.deleteById(id);
}

