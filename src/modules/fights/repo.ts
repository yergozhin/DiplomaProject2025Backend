import { query } from '@src/db/client';
import type {
  Fight,
  FightRequestWithSender,
  FightWithFighters,
} from './model';

export async function all(): Promise<Fight[]> {
  const r = await query<Fight>(
    'select id, fighter_a_id as "fighterAId", fighter_b_id as "fighterBId", status from fights order by id desc',
  );
  return r.rows;
}

export async function create(fighterAId: string, fighterBId: string): Promise<Fight> {
  const r = await query<Fight>(
    'insert into fights (fighter_a_id, fighter_b_id, status) values ($1, $2, $3) returning id, fighter_a_id as "fighterAId", fighter_b_id as "fighterBId", status',
    [fighterAId, fighterBId, 'requested'],
  );
  return r.rows[0];
}

export async function findExisting(fighterAId: string, fighterBId: string): Promise<Fight | null> {
  const r = await query<Fight>(
    'select id, fighter_a_id as "fighterAId", fighter_b_id as "fighterBId", status from fights where ((fighter_a_id=$1 and fighter_b_id=$2) or (fighter_a_id=$2 and fighter_b_id=$1)) and status != $3 limit 1',
    [fighterAId, fighterBId, 'deleted'],
  );
  return r.rows[0] || null;
}

export async function getFighterById(id: string): Promise<{ id: string } | null> {
  const r = await query<{ id: string }>(
    'select id from users where id=$1 and role=$2',
    [id, 'fighter'],
  );
  return r.rows[0] || null;
}

export async function getRequestsTo(fighterId: string): Promise<FightRequestWithSender[]> {
  const r = await query<FightRequestWithSender>(`
    select 
      f.id,
      f.status,
      f.fighter_a_id as "fighterAId",
      f.fighter_b_id as "fighterBId",
      u.id as "senderId",
      u.email as "senderEmail",
      u.name as "senderName",
      u.weight_class as "senderWeightClass"
    from fights f
    join users u on f.fighter_a_id = u.id
    where f.fighter_b_id = $1 and f.status = $2
    order by f.id desc
  `, [fighterId, 'requested']);
  return r.rows;
}

export async function getById(id: string): Promise<Fight | null> {
  const r = await query<Fight>(
    'select id, fighter_a_id as "fighterAId", fighter_b_id as "fighterBId", status from fights where id=$1',
    [id],
  );
  return r.rows[0] || null;
}

export async function accept(id: string): Promise<Fight | null> {
  const r = await query<Fight>(
    'update fights set status=$1 where id=$2 returning id, fighter_a_id as "fighterAId", fighter_b_id as "fighterBId", status',
    ['accepted', id],
  );
  return r.rows[0] || null;
}

export async function getAccepted(): Promise<FightWithFighters[]> {
  const r = await query<FightWithFighters>(`
    select 
      f.id,
      f.status,
      f.fighter_a_id as "fighterAId",
      f.fighter_b_id as "fighterBId",
      ua.id as "fighterAUserId",
      ua.email as "fighterAEmail",
      ua.name as "fighterAName",
      ua.weight_class as "fighterAWeightClass",
      ub.id as "fighterBUserId",
      ub.email as "fighterBEmail",
      ub.name as "fighterBName",
      ub.weight_class as "fighterBWeightClass"
    from fights f
    join users ua on f.fighter_a_id = ua.id
    join users ub on f.fighter_b_id = ub.id
    where f.status = $1
    order by f.id desc
  `, ['accepted']);
  return r.rows;
}

export async function getAcceptedForFighter(fighterId: string): Promise<FightWithFighters[]> {
  const r = await query<FightWithFighters>(`
    select 
      f.id,
      f.status,
      f.fighter_a_id as "fighterAId",
      f.fighter_b_id as "fighterBId",
      ua.id as "fighterAUserId",
      ua.email as "fighterAEmail",
      ua.name as "fighterAName",
      ua.weight_class as "fighterAWeightClass",
      ub.id as "fighterBUserId",
      ub.email as "fighterBEmail",
      ub.name as "fighterBName",
      ub.weight_class as "fighterBWeightClass"
    from fights f
    join users ua on f.fighter_a_id = ua.id
    join users ub on f.fighter_b_id = ub.id
    where f.status = $1 and (f.fighter_a_id = $2 or f.fighter_b_id = $2)
    order by f.id desc
  `, ['accepted', fighterId]);
  return r.rows;
}

export async function getScheduledForFighter(fighterId: string): Promise<FightWithFighters[]> {
  const r = await query<FightWithFighters>(`
    select 
      f.id,
      f.status,
      f.fighter_a_id as "fighterAId",
      f.fighter_b_id as "fighterBId",
      ua.id as "fighterAUserId",
      ua.email as "fighterAEmail",
      ua.name as "fighterAName",
      ua.weight_class as "fighterAWeightClass",
      ub.id as "fighterBUserId",
      ub.email as "fighterBEmail",
      ub.name as "fighterBName",
      ub.weight_class as "fighterBWeightClass"
    from fights f
    join users ua on f.fighter_a_id = ua.id
    join users ub on f.fighter_b_id = ub.id
    where f.status = $1 and (f.fighter_a_id = $2 or f.fighter_b_id = $2)
    order by f.id desc
  `, ['scheduled', fighterId]);
  return r.rows;
}

export async function getAvailableFightsForPlo(ploId: string): Promise<FightWithFighters[]> {
  const r = await query<FightWithFighters>(`
    select 
      f.id,
      f.status,
      f.fighter_a_id as "fighterAId",
      f.fighter_b_id as "fighterBId",
      ua.id as "fighterAUserId",
      ua.email as "fighterAEmail",
      ua.name as "fighterAName",
      ua.weight_class as "fighterAWeightClass",
      ub.id as "fighterBUserId",
      ub.email as "fighterBEmail",
      ub.name as "fighterBName",
      ub.weight_class as "fighterBWeightClass"
    from fights f
    join users ua on f.fighter_a_id = ua.id
    join users ub on f.fighter_b_id = ub.id
    where f.status = 'accepted'
      and (
        not exists (
          select 1 from offers o where o.fight_id = f.id and o.plo_id = $1
        )
        or not exists (
          select 1 from offers o 
          where o.fight_id = f.id 
            and o.plo_id = $1 
            and o.status in ('pending', 'accepted')
        )
      )
    order by f.id desc
  `, [ploId]);
  return r.rows;
}


