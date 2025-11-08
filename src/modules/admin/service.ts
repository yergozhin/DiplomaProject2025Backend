import * as repo from './repo';

export function getPlos() {
  return repo.listPlos();
}

export function setPloStatus(ploId: string, status: 'unverified' | 'verified') {
  return repo.updatePloStatus(ploId, status);
}
