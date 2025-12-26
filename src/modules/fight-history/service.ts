import * as repo from './repo';
import type { FightHistory, CreateHistoryFields } from './model';

export function create(fields: CreateHistoryFields) {
  return repo.create(fields);
}

export function getByFightId(fightId: string) {
  return repo.getByFightId(fightId);
}

export function getById(id: string) {
  return repo.getById(id);
}

