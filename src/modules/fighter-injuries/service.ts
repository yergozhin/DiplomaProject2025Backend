import * as repo from './repo';
import type { FighterInjury, CreateInjuryFields, UpdateInjuryFields } from './model';

export async function create(fields: CreateInjuryFields) {
  if (!fields.fighterId) throw new Error('Fighter ID required');
  if (!fields.injuryType || fields.injuryType.trim() === '') {
    throw new Error('Injury type is required');
  }
  return repo.create(fields);
}

export const getByFighterId = (fighterId: string) => repo.getByFighterId(fighterId);

export function getById(id: string) {
  return repo.getById(id);
}

export function update(id: string, fields: UpdateInjuryFields) {
  if (!id) throw new Error('ID required');
  return repo.update(id, fields);
}

export const remove = (id: string) => repo.deleteById(id);

