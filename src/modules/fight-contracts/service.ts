import * as repo from './repo';
import type { FightContract, CreateContractFields, UpdateContractFields } from './model';

export function create(fields: CreateContractFields) {
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

export function update(id: string, fields: UpdateContractFields) {
  return repo.update(id, fields);
}

export function deleteById(id: string) {
  return repo.deleteById(id);
}

