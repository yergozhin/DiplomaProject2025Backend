import * as repo from './repo';
import type { FightResult, CreateResultFields, UpdateResultFields } from './model';
import { query } from '@src/db/client';

async function recalculateFighterRecords(fighterProfileId: string) {
  const allFightsForFighterRes = await query<{
    fight_id: string;
    fighter_a_profile_id: string;
    fighter_b_profile_id: string;
    winner_id: string | null;
    result_type: string | null;
  }>(
    `select
      f.id as fight_id,
      f.fighter_a_profile_id,
      f.fighter_b_profile_id,
      fr.winner_id,
      fr.result_type
     from fights f
     join fight_results fr on f.id = fr.fight_id
     where f.fighter_a_profile_id = $1 or f.fighter_b_profile_id = $1`,
    [fighterProfileId],
  );

  let wins = 0;
  let losses = 0;
  let draws = 0;
  let totalFights = 0;

  for (const fight of allFightsForFighterRes.rows) {
    totalFights += 1;
    const isDraw = fight.result_type === 'draw' || fight.result_type === 'no_contest' || fight.winner_id === null;
    if (isDraw) {
      draws += 1;
    } else if (fight.winner_id === fighterProfileId) {
      wins += 1;
    } else {
      losses += 1;
    }
  }

  await query(
    `insert into fighter_records (fighter_id, wins, losses, draws, total_fights, updated_at)
     values ($1, $2, $3, $4, $5, now())
     on conflict (fighter_id) do update set
       wins = $2, losses = $3, draws = $4, total_fights = $5, updated_at = now()`,
    [fighterProfileId, wins, losses, draws, totalFights],
  );
}

export async function create(fields: CreateResultFields) {
  const result = await repo.create(fields);
  if (result.fightId) {
    const fightRes = await query<{
      fighter_a_profile_id: string;
      fighter_b_profile_id: string;
      event_id: string | null;
    }>(
      `select f.fighter_a_profile_id, f.fighter_b_profile_id, es.event_id
       from fights f
       join event_slots es on es.fight_id = f.id
       where f.id = $1`,
      [result.fightId],
    );
    const fight = fightRes.rows[0];
    if (fight) {
      await recalculateFighterRecords(fight.fighter_a_profile_id);
      await recalculateFighterRecords(fight.fighter_b_profile_id);
      if (fight.event_id) {
        const eventsService = await import('@src/modules/events/service');
        await eventsService.checkAndUpdateEventStatus(fight.event_id);
      }
    }
  }
  return result;
}

export function getByFightId(fightId: string) {
  return repo.getByFightId(fightId);
}

export function getById(id: string) {
  return repo.getById(id);
}

export async function update(id: string, fields: UpdateResultFields) {
  const existing = await repo.getById(id);
  if (!existing) {
    return null;
  }
  const result = await repo.update(id, fields);
  if (result && result.fightId) {
    const fightRes = await query<{
      fighter_a_profile_id: string;
      fighter_b_profile_id: string;
      event_id: string | null;
    }>(
      `select f.fighter_a_profile_id, f.fighter_b_profile_id, es.event_id
       from fights f
       join event_slots es on es.fight_id = f.id
       where f.id = $1`,
      [result.fightId],
    );
    const fight = fightRes.rows[0];
    if (fight) {
      await recalculateFighterRecords(fight.fighter_a_profile_id);
      await recalculateFighterRecords(fight.fighter_b_profile_id);
      if (fight.event_id) {
        const eventsService = await import('@src/modules/events/service');
        await eventsService.checkAndUpdateEventStatus(fight.event_id);
      }
    }
  }
  return result;
}

export function deleteById(id: string) {
  return repo.deleteById(id);
}

