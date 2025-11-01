import * as repo from './repo';

export function list() {
  return repo.all();
}

export async function sendRequest(fromFighterId: string, toFighterId: string) {
  if (fromFighterId === toFighterId) {
    return { error: 'cannot_request_self' };
  }
  const fighterA = await repo.getFighterById(fromFighterId);
  if (!fighterA) {
    return { error: 'sender_not_fighter' };
  }
  const fighterB = await repo.getFighterById(toFighterId);
  if (!fighterB) {
    return { error: 'receiver_not_fighter' };
  }
  const existing = await repo.findExisting(fromFighterId, toFighterId);
  if (existing) {
    return { error: 'request_exists' };
  }
  return repo.create(fromFighterId, toFighterId);
}

export function getRequestsTo(fighterId: string) {
  return repo.getRequestsTo(fighterId);
}


