import * as repo from './repo';
import type { FightResult, CreateResultFields, UpdateResultFields } from './model';
import { query } from '@src/db/client';
import * as eventsService from '@src/modules/events/service';

async function recalculateFighterRecords(fighterProfileId: string) {
  const allFightsForFighterRes = await query<{
    fight_id: string,
    fighter_a_profile_id: string,
    fighter_b_profile_id: string,
    winner_id: string | null,
    result_type: string | null,
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

  let appWins = 0;
  let appLosses = 0;
  let appDraws = 0;
  let appTotalFights = 0;

  for (const fight of allFightsForFighterRes.rows) {
    appTotalFights += 1;
    const isDraw = fight.result_type === 'draw' || fight.result_type === 'no_contest' || fight.winner_id === null;
    if (isDraw) {
      appDraws += 1;
    } else if (fight.winner_id === fighterProfileId) {
      appWins += 1;
    } else {
      appLosses += 1;
    }
  }

  const verificationTotalsRes = await query<{
    wins: string | null,
    losses: string | null,
    draws: string | null,
  }>(
    `select
       coalesce(sum(wins), 0)   as wins,
       coalesce(sum(losses), 0) as losses,
       coalesce(sum(draws), 0)  as draws
     from fighter_verifications fv
     where fv.fighter_profile_id = $1
       and fv.status = 'accepted'`,
    [fighterProfileId],
  );

  const verificationTotals = verificationTotalsRes.rows[0];
  const verWins = parseInt(verificationTotals?.wins || '0', 10);
  const verLosses = parseInt(verificationTotals?.losses || '0', 10);
  const verDraws = parseInt(verificationTotals?.draws || '0', 10);
  const verTotalFights = verWins + verLosses + verDraws;

  const finalWins = appWins + verWins;
  const finalLosses = appLosses + verLosses;
  const finalDraws = appDraws + verDraws;
  const finalTotalFights = appTotalFights + verTotalFights;

  await query(
    `insert into fighter_records (fighter_id, wins, losses, draws, total_fights, updated_at)
     values ($1, $2, $3, $4, $5, now())
     on conflict (fighter_id) do update set
       wins = $2,
       losses = $3,
       draws = $4,
       total_fights = $5,
       updated_at = now()`,
    [fighterProfileId, finalWins, finalLosses, finalDraws, finalTotalFights],
  );
}

export async function create(fields: CreateResultFields) {
  const result = await repo.create(fields);
  
  if (result.fightId) {
    const fightRes = await query<{
      fighter_a_profile_id: string,
      fighter_b_profile_id: string,
      event_id: string | null,
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
        await eventsService.checkAndUpdateEventStatus(fight.event_id);
      }
    }
  }
  
  return result;
}

export const getByFightId = (fightId: string) => {
  return repo.getByFightId(fightId);
};

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
      fighter_a_profile_id: string,
      fighter_b_profile_id: string,
      event_id: string | null,
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
        await eventsService.checkAndUpdateEventStatus(fight.event_id);
      }
    }
  }
  
  return result;
}

export const remove = (id: string) => repo.deleteById(id);

