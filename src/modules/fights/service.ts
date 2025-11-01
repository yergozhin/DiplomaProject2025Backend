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

export async function acceptFight(fightId: string, fighterId: string) {
  const fight = await repo.getById(fightId);
  if (!fight) {
    return { error: 'fight_not_found' };
  }
  if (fight.status !== 'requested') {
    return { error: 'invalid_status' };
  }
  if (fight.fighterBId !== fighterId) {
    return { error: 'not_receiver' };
  }
  const updated = await repo.accept(fightId);
  if (!updated) {
    return { error: 'accept_failed' };
  }
  return updated;
}


