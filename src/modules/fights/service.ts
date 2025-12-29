import * as repo from './repo';
import * as historyRepo from '../fight-history/repo';

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
  const fight = await repo.create(fromFighterId, toFighterId);
  // Create history entry for initial 'requested' status
  await historyRepo.create({
    fightId: fight.id,
    status: 'requested',
    changedBy: fromFighterId,
    changeReason: null,
  });
  return fight;
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
  // Create history entry for 'accepted' status
  await historyRepo.create({
    fightId: updated.id,
    status: 'accepted',
    changedBy: fighterId,
    changeReason: null,
  });
  return updated;
}

export async function rejectFight(fightId: string, fighterId: string) {
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
  const updated = await repo.reject(fightId);
  if (!updated) {
    return { error: 'reject_failed' };
  }
  // Create history entry for 'deleted' status (rejected)
  await historyRepo.create({
    fightId: updated.id,
    status: 'deleted',
    changedBy: fighterId,
    changeReason: 'Fight request rejected',
  });
  return updated;
}

export function getAccepted() {
  return repo.getAccepted();
}

export function getAcceptedForFighter(fighterId: string) {
  return repo.getAcceptedForFighter(fighterId);
}

export function getScheduledForFighter(fighterId: string) {
  return repo.getScheduledForFighter(fighterId);
}

export function getAvailableFightsForPlo(ploId: string) {
  return repo.getAvailableFightsForPlo(ploId);
}

export function getByIdWithFighters(id: string) {
  return repo.getByIdWithFighters(id);
}


