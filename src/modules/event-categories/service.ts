import * as repo from './repo';
import type { EventCategory, CreateCategoryFields, UpdateCategoryFields, EventCategoryAssignment } from './model';

export function create(fields: CreateCategoryFields) {
  return repo.create(fields);
}

export function all() {
  return repo.all();
}

export function getById(id: string) {
  return repo.getById(id);
}

export function update(id: string, fields: UpdateCategoryFields) {
  return repo.update(id, fields);
}

export function deleteById(id: string) {
  return repo.deleteById(id);
}

export function assignToEvent(eventId: string, categoryId: string) {
  return repo.assignToEvent(eventId, categoryId);
}

export function removeFromEvent(eventId: string, categoryId: string) {
  return repo.removeFromEvent(eventId, categoryId);
}

export function getByEventId(eventId: string) {
  return repo.getByEventId(eventId);
}

