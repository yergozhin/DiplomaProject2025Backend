import * as repo from './repo';
import type { FightStatistic, CreateStatisticFields, UpdateStatisticFields } from './model';

export function create(fields: CreateStatisticFields) {
  if (!fields.fightId) throw new Error('Fight ID required');
  return repo.create(fields);
}

export function getByFightId(fightId: string) {
  return repo.getByFightId(fightId);
}

export function getByFighterId(fighterId: string) {
  return repo.getByFighterId(fighterId);
}

export function getById(id: string) {
  return repo.getById(id);
}

export async function update(id: string, fields: UpdateStatisticFields) {
  if (!id) throw new Error('ID required');
  
  return repo.update(id, fields);
}

export function deleteStatistic(id: string) {
  return repo.deleteById(id);
}

