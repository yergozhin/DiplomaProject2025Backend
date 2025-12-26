import * as repo from './repo';
import type { WeightClass, CreateWeightClassFields, UpdateWeightClassFields } from './model';

export function create(fields: CreateWeightClassFields) {
  return repo.create(fields);
}

export function all() {
  return repo.all();
}

export function getById(id: string) {
  return repo.getById(id);
}

export function getByName(name: string) {
  return repo.getByName(name);
}

export function update(id: string, fields: UpdateWeightClassFields) {
  return repo.update(id, fields);
}

export function deleteById(id: string) {
  return repo.deleteById(id);
}

