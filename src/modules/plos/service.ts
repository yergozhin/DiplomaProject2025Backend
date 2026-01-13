import * as repo from './repo';
import type { PloProfileUpdate } from './repo';

export const getProfile = (ploId: string) => repo.getProfile(ploId);

export function updateProfile(ploId: string, fields: PloProfileUpdate) {
  if (!ploId) throw new Error('PLO ID required');
  
  return repo.updateProfile(ploId, fields);
}


