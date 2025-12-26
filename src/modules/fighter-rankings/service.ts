import * as repo from './repo';
import type { FighterRanking, CreateRankingFields, UpdateRankingFields } from './model';

export function create(fields: CreateRankingFields) {
  return repo.create(fields);
}

export function getByFighterId(fighterId: string) {
  return repo.getByFighterId(fighterId);
}

export function getByWeightClass(weightClassId: string) {
  return repo.getByWeightClass(weightClassId);
}

export function getById(id: string) {
  return repo.getById(id);
}

export function update(id: string, fields: UpdateRankingFields) {
  return repo.update(id, fields);
}

export function deleteById(id: string) {
  return repo.deleteById(id);
}

