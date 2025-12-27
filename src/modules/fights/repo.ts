import { query } from '@src/db/client';
import type {
  Fight,
  FightRequestWithSender,
  FightWithFighters,
} from './model';

export async function all(): Promise<Fight[]> {
  const r = await query<Fight>(
    `select 
      f.id, 
      fpa.user_id as "fighterAId", 
      fpb.user_id as "fighterBId", 
      f.status 
    from fights f
    join fighter_profiles fpa on f.fighter_a_id = fpa.id
    join fighter_profiles fpb on f.fighter_b_id = fpb.id
    order by f.id desc`,
  );
  return r.rows;
}

export async function create(fighterAId: string, fighterBId: string): Promise<Fight> {
  const r = await query<Fight>(
    `insert into fights (fighter_a_id, fighter_b_id, status) 
     values (
       (select id from fighter_profiles where user_id = $1),
       (select id from fighter_profiles where user_id = $2),
       $3
     ) 
     returning 
       id, 
       $1 as "fighterAId", 
       $2 as "fighterBId", 
       status`,
    [fighterAId, fighterBId, 'requested'],
  );
  return r.rows[0];
}

export async function findExisting(fighterAId: string, fighterBId: string): Promise<Fight | null> {
  const r = await query<Fight>(
    `select 
       f.id, 
       fpa.user_id as "fighterAId", 
       fpb.user_id as "fighterBId", 
       f.status 
     from fights f
     join fighter_profiles fpa on f.fighter_a_id = fpa.id
     join fighter_profiles fpb on f.fighter_b_id = fpb.id
     where (
       (fpa.user_id = $1 and fpb.user_id = $2)
       or (fpa.user_id = $2 and fpb.user_id = $1)
     ) and f.status != $3 
     limit 1`,
    [fighterAId, fighterBId, 'deleted'],
  );
  return r.rows[0] ?? null;
}

export async function getFighterById(id: string): Promise<{ id: string } | null> {
  const r = await query<{ id: string }>(
    'select id from users where id=$1 and role=$2',
    [id, 'fighter'],
  );
  return r.rows[0] ?? null;
}

export async function getRequestsTo(fighterId: string): Promise<FightRequestWithSender[]> {
  const r = await query<FightRequestWithSender>(`
    select 
      f.id,
      f.status,
      fpa.user_id as "fighterAId",
      fpb.user_id as "fighterBId",
      u.id as "senderId",
      u.email as "senderEmail",
      coalesce(fp.first_name || ' ' || fp.last_name, fp.first_name, fp.last_name, u.name) as "senderName",
      wc.name as "senderWeightClass"
    from fights f
    join fighter_profiles fpa on f.fighter_a_id = fpa.id
    join fighter_profiles fpb on f.fighter_b_id = fpb.id
    join users u on fpa.user_id = u.id
    left join fighter_profiles fp on fpa.id = fp.id
    left join fighter_physical_attributes fpa_attr on fp.id = fpa_attr.fighter_id
    left join weight_classes wc on fpa_attr.weight_class_id = wc.id
    where fpb.user_id = $1 and f.status = $2
    order by f.id desc
  `, [fighterId, 'requested']);
  return r.rows;
}

export async function getById(id: string): Promise<Fight | null> {
  const r = await query<Fight>(
    `select 
      f.id, 
      fpa.user_id as "fighterAId", 
      fpb.user_id as "fighterBId", 
      f.status 
    from fights f
    join fighter_profiles fpa on f.fighter_a_id = fpa.id
    join fighter_profiles fpb on f.fighter_b_id = fpb.id
    where f.id = $1`,
    [id],
  );
  return r.rows[0] ?? null;
}

export async function accept(id: string): Promise<Fight | null> {
  const r = await query<Fight>(
    `update fights f
     set status=$1
     from fighter_profiles fpa, fighter_profiles fpb
     where f.id = $2 
       and f.fighter_a_id = fpa.id
       and f.fighter_b_id = fpb.id
     returning f.id, fpa.user_id as "fighterAId", fpb.user_id as "fighterBId", f.status`,
    ['accepted', id],
  );
  return r.rows[0] ?? null;
}

export async function getAccepted(): Promise<FightWithFighters[]> {
  const r = await query<FightWithFighters>(`
    select 
      f.id,
      f.status,
      fpa.user_id as "fighterAId",
      fpb.user_id as "fighterBId",
      ua.id as "fighterAUserId",
      ua.email as "fighterAEmail",
      coalesce(fpa.first_name || ' ' || fpa.last_name, fpa.first_name, fpa.last_name, ua.name) as "fighterAName",
      wca.name as "fighterAWeightClass",
      ub.id as "fighterBUserId",
      ub.email as "fighterBEmail",
      coalesce(fpb.first_name || ' ' || fpb.last_name, fpb.first_name, fpb.last_name, ub.name) as "fighterBName",
      wcb.name as "fighterBWeightClass"
    from fights f
    join fighter_profiles fpa on f.fighter_a_id = fpa.id
    join fighter_profiles fpb on f.fighter_b_id = fpb.id
    join users ua on fpa.user_id = ua.id
    join users ub on fpb.user_id = ub.id
    left join fighter_physical_attributes fpaa on fpa.id = fpaa.fighter_id
    left join fighter_physical_attributes fpab on fpb.id = fpab.fighter_id
    left join weight_classes wca on fpaa.weight_class_id = wca.id
    left join weight_classes wcb on fpab.weight_class_id = wcb.id
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
      fpa.user_id as "fighterAId",
      fpb.user_id as "fighterBId",
      ua.id as "fighterAUserId",
      ua.email as "fighterAEmail",
      coalesce(fpa.first_name || ' ' || fpa.last_name, fpa.first_name, fpa.last_name, ua.name) as "fighterAName",
      wca.name as "fighterAWeightClass",
      ub.id as "fighterBUserId",
      ub.email as "fighterBEmail",
      coalesce(fpb.first_name || ' ' || fpb.last_name, fpb.first_name, fpb.last_name, ub.name) as "fighterBName",
      wcb.name as "fighterBWeightClass"
    from fights f
    join fighter_profiles fpa on f.fighter_a_id = fpa.id
    join fighter_profiles fpb on f.fighter_b_id = fpb.id
    join users ua on fpa.user_id = ua.id
    join users ub on fpb.user_id = ub.id
    left join fighter_physical_attributes fpaa on fpa.id = fpaa.fighter_id
    left join fighter_physical_attributes fpab on fpb.id = fpab.fighter_id
    left join weight_classes wca on fpaa.weight_class_id = wca.id
    left join weight_classes wcb on fpab.weight_class_id = wcb.id
    where f.status = $1 and (fpa.user_id = $2 or fpb.user_id = $2)
    order by f.id desc
  `, ['accepted', fighterId]);
  return r.rows;
}

export async function getScheduledForFighter(fighterId: string): Promise<FightWithFighters[]> {
  const r = await query<FightWithFighters>(`
    select 
      f.id,
      f.status,
      fpa.user_id as "fighterAId",
      fpb.user_id as "fighterBId",
      ua.id as "fighterAUserId",
      ua.email as "fighterAEmail",
      coalesce(fpa.first_name || ' ' || fpa.last_name, fpa.first_name, fpa.last_name, ua.name) as "fighterAName",
      wca.name as "fighterAWeightClass",
      ub.id as "fighterBUserId",
      ub.email as "fighterBEmail",
      coalesce(fpb.first_name || ' ' || fpb.last_name, fpb.first_name, fpb.last_name, ub.name) as "fighterBName",
      wcb.name as "fighterBWeightClass"
    from fights f
    join fighter_profiles fpa on f.fighter_a_id = fpa.id
    join fighter_profiles fpb on f.fighter_b_id = fpb.id
    join users ua on fpa.user_id = ua.id
    join users ub on fpb.user_id = ub.id
    left join fighter_physical_attributes fpaa on fpa.id = fpaa.fighter_id
    left join fighter_physical_attributes fpab on fpb.id = fpab.fighter_id
    left join weight_classes wca on fpaa.weight_class_id = wca.id
    left join weight_classes wcb on fpab.weight_class_id = wcb.id
    where f.status = $1 and (fpa.user_id = $2 or fpb.user_id = $2)
    order by f.id desc
  `, ['scheduled', fighterId]);
  return r.rows;
}

export async function getAvailableFightsForPlo(ploId: string): Promise<FightWithFighters[]> {
  const r = await query<FightWithFighters>(`
    select 
      f.id,
      f.status,
      fpa.user_id as "fighterAId",
      fpb.user_id as "fighterBId",
      ua.id as "fighterAUserId",
      ua.email as "fighterAEmail",
      coalesce(fpa.first_name || ' ' || fpa.last_name, fpa.first_name, fpa.last_name, ua.name) as "fighterAName",
      wca.name as "fighterAWeightClass",
      ub.id as "fighterBUserId",
      ub.email as "fighterBEmail",
      coalesce(fpb.first_name || ' ' || fpb.last_name, fpb.first_name, fpb.last_name, ub.name) as "fighterBName",
      wcb.name as "fighterBWeightClass"
    from fights f
    join fighter_profiles fpa on f.fighter_a_id = fpa.id
    join fighter_profiles fpb on f.fighter_b_id = fpb.id
    join users ua on fpa.user_id = ua.id
    join users ub on fpb.user_id = ub.id
    left join fighter_physical_attributes fpaa on fpa.id = fpaa.fighter_id
    left join fighter_physical_attributes fpab on fpb.id = fpab.fighter_id
    left join weight_classes wca on fpaa.weight_class_id = wca.id
    left join weight_classes wcb on fpab.weight_class_id = wcb.id
    where f.status = 'accepted'
      and (
        not exists (
          select 1 from offers o 
          join plo_profiles pp on o.plo_profile_id = pp.id
          where o.fight_id = f.id and pp.user_id = $1
        )
        or not exists (
          select 1 from offers o 
          join plo_profiles pp on o.plo_profile_id = pp.id
          where o.fight_id = f.id 
            and pp.user_id = $1 
            and o.status in ('pending', 'accepted')
        )
      )
    order by f.id desc
  `, [ploId]);
  return r.rows;
}


