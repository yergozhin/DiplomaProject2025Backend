import * as repo from './repo';
import type { FighterProfileFields, FighterRecordFields } from './repo';

export function list() {
  return repo.all();
}

export function updateProfile(id: string, fields: FighterProfileFields) {
  return repo.updateProfile(id, fields);
}

export function getById(id: string) {
  return repo.getById(id);
}

export function listExcept(userId: string) {
  return repo.allExcept(userId);
}

export function updateRecord(fighterId: string, adminId: string, fields: FighterRecordFields) {
  return repo.updateRecord(fighterId, adminId, fields);
}


