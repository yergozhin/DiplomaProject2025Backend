import * as repo from './repo';
import type { FightHistory, CreateHistoryFields } from './model';

export const create = async (fields: CreateHistoryFields) => {
  return repo.create(fields);
};

export function getByFightId(fightId: string) {
  return repo.getByFightId(fightId);
}

export const getById = (id: string) => repo.getById(id);

