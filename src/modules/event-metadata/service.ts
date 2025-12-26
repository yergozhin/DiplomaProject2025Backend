import * as repo from './repo';
import type { EventMetadata, CreateMetadataFields, UpdateMetadataFields } from './model';

export function create(fields: CreateMetadataFields) {
  return repo.create(fields);
}

export function getByEventId(eventId: string) {
  return repo.getByEventId(eventId);
}

export function getById(id: string) {
  return repo.getById(id);
}

export function update(id: string, fields: UpdateMetadataFields) {
  return repo.update(id, fields);
}

export function deleteById(id: string) {
  return repo.deleteById(id);
}

