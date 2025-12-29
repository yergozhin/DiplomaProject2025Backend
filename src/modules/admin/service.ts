import * as repo from './repo';

export function getPlos() {
  return repo.listPlos();
}

export function setPloStatus(ploId: string, status: 'unverified' | 'verified') {
  return repo.updatePloStatus(ploId, status);
}

export function getUsers() {
  return repo.listUsers();
}

export function verifyEmail(userId: string) {
  return repo.verifyUserEmail(userId);
}
