import * as repo from './repo';
import type { EventLocation, CreateLocationFields, UpdateLocationFields } from './model';

export const create = async (fields: CreateLocationFields) => {
  if (!fields.eventId) throw new Error('Event ID required');
  return repo.create(fields);
};

export function getByEventId(eventId: string) {
  return repo.getByEventId(eventId);
}

export const getById = (id: string) => repo.getById(id);

export async function update(id: string, fields: UpdateLocationFields) {
  if (!id) throw new Error('ID required');
  return repo.update(id, fields);
}

export function remove(id: string) {
  return repo.deleteById(id);
}

