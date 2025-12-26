import * as repo from './repo';
import type { PloEventStatistics, CreateStatisticsFields, UpdateStatisticsFields } from './model';

export function create(fields: CreateStatisticsFields) {
  return repo.create(fields);
}

export function getByPloId(ploId: string) {
  return repo.getByPloId(ploId);
}

export function getById(id: string) {
  return repo.getById(id);
}

export function update(id: string, fields: UpdateStatisticsFields) {
  return repo.update(id, fields);
}

export function deleteById(id: string) {
  return repo.deleteById(id);
}

