import * as repo from './repo';
import type { EventStatusHistory, CreateStatusHistoryFields } from './model';

export function create(fields: CreateStatusHistoryFields) {
  return repo.create(fields);
}

export function getByEventId(eventId: string) {
  return repo.getByEventId(eventId);
}

export function getById(id: string) {
  return repo.getById(id);
}

