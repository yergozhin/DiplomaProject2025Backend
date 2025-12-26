import * as repo from './repo';
import type { FightResult, CreateResultFields, UpdateResultFields } from './model';

export function create(fields: CreateResultFields) {
  return repo.create(fields);
}

export function getByFightId(fightId: string) {
  return repo.getByFightId(fightId);
}

export function getById(id: string) {
  return repo.getById(id);
}

export function update(id: string, fields: UpdateResultFields) {
  return repo.update(id, fields);
}

export function deleteById(id: string) {
  return repo.deleteById(id);
}

