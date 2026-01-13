import * as repo from './repo';
import type { PloEventStatistics, CreateStatisticsFields, UpdateStatisticsFields } from './model';

export const create = async (fields: CreateStatisticsFields) => {
  return repo.create(fields);
};

export function getByPloId(ploId: string) {
  return repo.getByPloId(ploId);
}

export const getById = (id: string) => repo.getById(id);

export async function update(id: string, fields: UpdateStatisticsFields) {
  if (!id) throw new Error('ID required');
  return repo.update(id, fields);
}

export function remove(id: string) {
  return repo.deleteById(id);
}

