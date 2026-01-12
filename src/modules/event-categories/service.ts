import * as repo from './repo';
import type { EventCategory, CreateCategoryFields, UpdateCategoryFields, EventCategoryAssignment } from './model';

export const create = async (fields: CreateCategoryFields) => {
  if (!fields.name || fields.name.trim() === '') {
    throw new Error('Category name is required');
  }
  return repo.create(fields);
};

export function list() {
  return repo.all();
}

export function getById(id: string) {
  return repo.getById(id);
}

export async function update(id: string, fields: UpdateCategoryFields) {
  if (!id) throw new Error('ID required');
  
  if (fields.name !== undefined) {
    if (fields.name && fields.name.trim() === '') {
      throw new Error('Category name cannot be empty');
    }
  }
  
  return repo.update(id, fields);
}

export function deleteCategory(id: string) {
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

