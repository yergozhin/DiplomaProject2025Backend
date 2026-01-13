import * as repo from './repo';
import type { WeightClass, CreateWeightClassFields, UpdateWeightClassFields } from './model';

export async function create(fields: CreateWeightClassFields) {
  if (!fields.name || fields.name.trim().length === 0) {
    throw new Error('Weight class name is required');
  }

  if (fields.minWeightKg != null && fields.maxWeightKg != null) {
    if (fields.minWeightKg >= fields.maxWeightKg) {
      throw new Error('Min weight must be less than max weight');
    }
  }
  return repo.create(fields);
}

export function getAll() {
  return repo.all();
}

export function getById(id: string) {
  return repo.getById(id);
}

export function getByName(name: string) {
  return repo.getByName(name);
}

export async function update(id: string, fields: UpdateWeightClassFields) {
  if (!id) throw new Error('ID is required');
  
  if (fields.minWeightKg != null && fields.maxWeightKg != null) {
    if (fields.minWeightKg >= fields.maxWeightKg) {
      throw new Error('Invalid weight range');
    }
  }
  
  return repo.update(id, fields);
}

export function remove(id: string) {
  return repo.deleteById(id);
}

