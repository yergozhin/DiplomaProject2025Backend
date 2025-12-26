import * as repo from './repo';
import type { MedicalClearance, CreateClearanceFields, UpdateClearanceFields } from './model';

export function create(fields: CreateClearanceFields) {
  return repo.create(fields);
}

export function getByFighterId(fighterId: string) {
  return repo.getByFighterId(fighterId);
}

export function getById(id: string) {
  return repo.getById(id);
}

export function update(id: string, fields: UpdateClearanceFields) {
  return repo.update(id, fields);
}

export function deleteById(id: string) {
  return repo.deleteById(id);
}

