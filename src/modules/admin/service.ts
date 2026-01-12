import * as repo from './repo';

export const getPlos = () => repo.listPlos();

export async function setPloStatus(ploId: string, status: 'unverified' | 'verified') {
  if (!ploId) throw new Error('PLO ID required');
  
  if (status !== 'unverified' && status !== 'verified') {
    throw new Error('Invalid status');
  }
  
  return repo.updatePloStatus(ploId, status);
}

export function getUsers() {
  return repo.listUsers();
}

export function verifyEmail(userId: string) {
  if (!userId) throw new Error('User ID required');
  
  return repo.verifyUserEmail(userId);
}

export function getMedicalClearances() {
  return repo.listMedicalClearances();
}
