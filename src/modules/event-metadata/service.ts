import * as repo from './repo';
import type { EventMetadata, CreateMetadataFields, UpdateMetadataFields } from './model';

export function create(fields: CreateMetadataFields) {
  return repo.create(fields);
}

export function getByEventId(eventId: string) {
  if (!eventId) {
    return Promise.resolve(null);
  }
  return repo.getByEventId(eventId);
}

export function getById(id: string) {
  return repo.getById(id);
}

export function update(id: string, fields: UpdateMetadataFields) {
  if (!id) throw new Error('ID required');
  return repo.update(id, fields);
}

export const deleteMetadata = (id: string) => repo.deleteById(id);

