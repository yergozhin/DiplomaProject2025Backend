import * as repo from './repo';
import type { Fighter } from './model';
import type {
  FighterProfileFields,
  FighterRecordFields,
  CreateVerificationFields,
  VerificationStatus,
  OpponentFilters,
} from './repo';

export const list = () => repo.all();

export function updateProfile(id: string, fields: FighterProfileFields) {
  if (!id) throw new Error('Fighter ID required');
  
  return repo.updateProfile(id, fields);
}

export const getById = (id: string) => repo.getById(id);

export function listExcept(userId: string, filters?: OpponentFilters) {
  return repo.allExcept(userId, filters);
}

export async function updateRecord(
  fighterId: string,
  adminId: string,
  fields: FighterRecordFields,
): Promise<{ fighter: Fighter | null, error?: 'invalid_record' | 'not_found' }> {
  if (fields.totalFights !== null) {
    const wins = fields.wins || 0;
    const losses = fields.losses || 0;
    const draws = fields.draws || 0;
    const total = wins + losses + draws;
    
    if (total > fields.totalFights) {
      return { fighter: null, error: 'invalid_record' };
    }
  }
  
  const fighter = await repo.updateRecord(fighterId, adminId, fields);
  if (!fighter) {
    return { fighter: null, error: 'not_found' };
  }
  
  return { fighter };
}

export function createVerification(fighterId: string, payload: CreateVerificationFields) {
  if (!fighterId) throw new Error('Fighter ID required');
  if (!payload.type || !payload.value) {
    throw new Error('Verification type and value are required');
  }
  return repo.createVerification(fighterId, payload);
}

export function listVerifications(fighterId: string) {
  return repo.listVerificationsByFighter(fighterId);
}

export const listPendingVerifications = () => repo.listPendingVerifications();

export function updateVerificationStatus(
  verificationId: string,
  adminId: string,
  status: Exclude<VerificationStatus, 'pending'>,
  adminNote: string | null,
) {
  return repo.updateVerificationStatus(verificationId, adminId, status, adminNote);
}

export function listFightersWithPendingVerifications() {
  return repo.listFightersWithPendingVerifications();
}

export const getPendingVerificationDetails = (fighterId: string) => repo.getPendingVerificationDetails(fighterId);


