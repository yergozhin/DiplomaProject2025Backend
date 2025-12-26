import * as repo from './repo';
import type { FighterInjury, CreateInjuryFields, UpdateInjuryFields } from './model';

export function create(fields: CreateInjuryFields) {
  return repo.create(fields);
}

export function getByFighterId(fighterId: string) {
  return repo.getByFighterId(fighterId);
}

export function getById(id: string) {
  return repo.getById(id);
}

export function update(id: string, fields: UpdateInjuryFields) {
  return repo.update(id, fields);
}

export function deleteById(id: string) {
  return repo.deleteById(id);
}

