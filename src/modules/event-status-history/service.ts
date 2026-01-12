import * as repo from './repo';
import type { EventStatusHistory, CreateStatusHistoryFields } from './model';

export const create = async (fields: CreateStatusHistoryFields) => {
  return repo.create(fields);
};

export function getByEventId(eventId: string) {
  return repo.getByEventId(eventId);
}

export const getById = (id: string) => repo.getById(id);

