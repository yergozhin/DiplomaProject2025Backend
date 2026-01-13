import * as repo from './repo';
import type { MedicalClearance, CreateClearanceFields, UpdateClearanceFields } from './model';

export const create = async (fields: CreateClearanceFields) => {
  if (!fields.fighterId) throw new Error('Fighter ID required');
  if (!fields.status) throw new Error('Status is required');
  return repo.create(fields);
};

export function getByFighterId(fighterId: string) {
  return repo.getByFighterId(fighterId);
}

export const getById = (id: string) => repo.getById(id);

export async function update(id: string, fields: UpdateClearanceFields) {
  if (!id) throw new Error('ID required');
  return repo.update(id, fields);
}

export function remove(id: string) {
  return repo.deleteById(id);
}

