import * as repo from './repo';
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

export function updateRecord(fighterId: string, adminId: string, fields: FighterRecordFields) {
  return repo.updateRecord(fighterId, adminId, fields);
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


