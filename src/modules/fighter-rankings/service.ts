import * as repo from './repo';
import type { FighterRanking, CreateRankingFields, UpdateRankingFields } from './model';

export async function create(fields: CreateRankingFields) {
  return repo.create(fields);
}

export const getByFighterId = (fighterId: string) => repo.getByFighterId(fighterId);

export function getByWeightClass(weightClassId: string) {
  return repo.getByWeightClass(weightClassId);
}

export function getById(id: string) {
  return repo.getById(id);
}

export const update = async (id: string, fields: UpdateRankingFields) => {
  if (!id) throw new Error('ID required');
  return repo.update(id, fields);
};

export function getAllLatest() {
  return repo.getAllLatest();
}

export function remove(id: string) {
  return repo.deleteById(id);
}

