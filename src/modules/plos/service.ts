import * as repo from './repo';
import type { PloProfileUpdate } from './repo';

export function getProfile(ploId: string) {
  return repo.getProfile(ploId);
}

export function updateProfile(ploId: string, fields: PloProfileUpdate) {
  return repo.updateProfile(ploId, fields);
}


