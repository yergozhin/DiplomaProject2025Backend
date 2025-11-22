import * as repo from './repo';
import type { Fighter } from './model';
import type {
  FighterProfileFields,
  FighterRecordFields,
  CreateVerificationFields,
  VerificationStatus,
} from './repo';

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

export async function updateRecord(
  fighterId: string,
  adminId: string,
  fields: FighterRecordFields,
): Promise<{ fighter: Fighter | null; error?: 'invalid_record' | 'not_found' }> {
  if (fields.totalFights !== null) {
    const sum = (fields.wins ?? 0) + (fields.losses ?? 0) + (fields.draws ?? 0);
    if (sum > fields.totalFights) {
      return { fighter: null, error: 'invalid_record' };
    }
  }
  const updated = await repo.updateRecord(fighterId, adminId, fields);
  if (!updated) {
    return { fighter: null, error: 'not_found' };
  }
  return { fighter: updated };
}

export function createVerification(fighterId: string, payload: CreateVerificationFields) {
  return repo.createVerification(fighterId, payload);
}

export function listVerifications(fighterId: string) {
  return repo.listVerificationsByFighter(fighterId);
}

export function listPendingVerifications() {
  return repo.listPendingVerifications();
}

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

export function getPendingVerificationDetails(fighterId: string) {
  return repo.getPendingVerificationDetails(fighterId);
}


