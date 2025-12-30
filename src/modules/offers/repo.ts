import { query } from '@src/db/client';
import type {
  Offer,
  OfferWithFightDetails,
  OfferWithOverallStatus,
} from './model';

interface FightRow {
  id: string;
  fighterAId: string;
  fighterBId: string;
  status: string;
}

interface EventRow {
  id: string;
  ploId: string;
}

interface EventSlotRow {
  id: string;
  eventId: string;
  fightId: string | null;
  startTime: string | null;
}

const offerSelect = `
  select
    o.id,
    o.fight_id as "fightId",
    o.event_id as "eventId",
    o.event_slot_id as "eventSlotId",
    fp.user_id as "fighterId",
    pp.user_id as "ploId",
    o.amount,
    o.currency,
    o.status,
    o.created_at as "createdAt"
  from offers o
  left join fighter_profiles fp on o.fighter_profile_id = fp.id
  left join plo_profiles pp on o.plo_profile_id = pp.id
`;

export async function all(): Promise<Offer[]> {
  const sql = `
    ${offerSelect}
    order by created_at desc
  `;
  const r = await query<Offer>(sql);
  return r.rows;
}

export async function create(
  fightId: string,
  eventId: string,
  eventSlotId: string,
  fighterId: string,
  ploId: string,
  amount: number,
  currency: string,
): Promise<Offer> {
  const sql = `
    insert into offers (
      fight_id,
      event_id,
      event_slot_id,
      fighter_profile_id,
      plo_profile_id,
      amount,
      currency,
      status
    ) values ($1, $2, $3, (select id from fighter_profiles where user_id = $4), (select id from plo_profiles where user_id = $5), $6, $7, $8)
    returning
      id,
      fight_id as "fightId",
      event_id as "eventId",
      event_slot_id as "eventSlotId",
      $4 as "fighterId",
      $5 as "ploId",
      amount,
      currency,
      status,
      created_at as "createdAt"
  `;
  const r = await query<Offer>(sql, [
    fightId,
    eventId,
    eventSlotId,
    fighterId,
    ploId,
    amount,
    currency,
    'pending',
  ]);
  return r.rows[0];
}

export async function getFightById(id: string): Promise<FightRow | null> {
  const sql = `
    select
      f.id,
      fpa.user_id as "fighterAId",
      fpb.user_id as "fighterBId",
      f.status
    from fights f
    join fighter_profiles fpa on f.fighter_a_profile_id = fpa.id
    join fighter_profiles fpb on f.fighter_b_profile_id = fpb.id
    where f.id = $1
  `;
  const r = await query<FightRow>(sql, [id]);
  return r.rows[0] ?? null;
}

export async function getEventById(id: string): Promise<EventRow | null> {
  const sql = `
    select e.id, pp.user_id as "ploId" 
    from events e
    left join plo_profiles pp on e.plo_profile_id = pp.id
    where e.id = $1
  `;
  const r = await query<EventRow>(sql, [id]);
  return r.rows[0] ?? null;
}

export async function getEventSlotById(id: string): Promise<EventSlotRow | null> {
  const sql = `
    select id, event_id as "eventId", fight_id as "fightId", start_time as "startTime" from event_slots where id = $1
  `;
  const r = await query<EventSlotRow>(sql, [id]);
  return r.rows[0] ?? null;
}

export async function findExistingOffer(
  fightId: string,
  ploId: string,
): Promise<Offer | null> {
  const sql = `
    ${offerSelect}
    where o.fight_id = $1 and pp.user_id = $2
    limit 1
  `;
  const r = await query<Offer>(sql, [fightId, ploId]);
  return r.rows[0] ?? null;
}

export async function getOffersForFightEventSlotPlo(
  fightId: string,
  eventId: string,
  eventSlotId: string,
  ploId: string,
): Promise<Offer[]> {
  const sql = `
    ${offerSelect}
    where o.fight_id = $1 and o.event_id = $2 and o.event_slot_id = $3 and pp.user_id = $4
  `;
  const r = await query<Offer>(sql, [fightId, eventId, eventSlotId, ploId]);
  return r.rows;
}

export async function getById(id: string): Promise<Offer | null> {
  const sql = `
    ${offerSelect}
    where o.id = $1
  `;
  const r = await query<Offer>(sql, [id]);
  return r.rows[0] ?? null;
}

export async function deleteByFightAndPlo(
  fightId: string,
  ploId: string,
): Promise<void> {
  await query('delete from offers where fight_id = $1 and plo_profile_id = (select id from plo_profiles where user_id = $2)', [fightId, ploId]);
}

export async function getAvailableByFighterId(
  fighterId: string,
): Promise<OfferWithOverallStatus[]> {
  const sql = `
    select 
      o.id,
      o.fight_id as "fightId",
      o.event_id as "eventId",
      o.event_slot_id as "eventSlotId",
      fp_join.user_id as "fighterId",
      pp_join.user_id as "ploId",
      o.amount,
      o.currency,
      o.status,
      o.created_at as "createdAt",
      e.name as "eventName",
      es.start_time as "slotStartTime",
      u.email as "ploEmail",
      fpa.user_id as "fighterAId",
      fpb.user_id as "fighterBId",
      oa.status as "fighterAStatus",
      ob.status as "fighterBStatus",
      case 
        when oa.status = 'rejected' or ob.status = 'rejected' then 'rejected'
        when oa.status = 'accepted' and ob.status = 'accepted' then 'accepted'
        else 'pending'
      end as "overallStatus"
    from offers o
    join events e on o.event_id = e.id
    join event_slots es on o.event_slot_id = es.id
    join plo_profiles pp_join on o.plo_profile_id = pp_join.id
    join users u on pp_join.user_id = u.id
    join fights f on o.fight_id = f.id
    join fighter_profiles fpa on f.fighter_a_profile_id = fpa.id
    join fighter_profiles fpb on f.fighter_b_profile_id = fpb.id
    join fighter_profiles fp_join on o.fighter_profile_id = fp_join.id
    join offers oa on oa.fight_id = f.id
      and oa.event_id = o.event_id
      and oa.event_slot_id = o.event_slot_id
      and oa.plo_profile_id = o.plo_profile_id
      and oa.fighter_profile_id = f.fighter_a_profile_id
    join offers ob on ob.fight_id = f.id
      and ob.event_id = o.event_id
      and ob.event_slot_id = o.event_slot_id
      and ob.plo_profile_id = o.plo_profile_id
      and ob.fighter_profile_id = f.fighter_b_profile_id
    where fp_join.user_id = $1 
      and o.status = 'pending'
      and not (oa.status = 'rejected' or ob.status = 'rejected')
      and not (oa.status = 'accepted' and ob.status = 'accepted')
    order by o.created_at desc
  `;
  const r = await query<OfferWithOverallStatus>(sql, [fighterId]);
  return r.rows;
}

export async function updateStatus(
  id: string,
  fighterId: string,
  status: 'accepted' | 'rejected',
): Promise<Offer | null> {
  const sql = `
    update offers o
    set status = $1
    from fighter_profiles fp
    where o.id = $2 and o.fighter_profile_id = fp.id and fp.user_id = $3
    returning
      o.id,
      o.fight_id as "fightId",
      o.event_id as "eventId",
      o.event_slot_id as "eventSlotId",
      fp.user_id as "fighterId",
      (select pp.user_id from plo_profiles pp where pp.id = o.plo_profile_id) as "ploId",
      o.amount,
      o.currency,
      o.status,
      o.created_at as "createdAt"
  `;
  const r = await query<Offer>(sql, [status, id, fighterId]);
  return r.rows[0] ?? null;
}

export async function getOffersForFightEventSlot(
  fightId: string,
  eventId: string,
  eventSlotId: string,
  ploId: string,
): Promise<Offer[]> {
  const sql = `
    ${offerSelect}
    where o.fight_id = $1 and o.event_id = $2 and o.event_slot_id = $3 and pp.user_id = $4
  `;
  const r = await query<Offer>(sql, [fightId, eventId, eventSlotId, ploId]);
  return r.rows;
}

export async function updateFightStatus(
  fightId: string,
  status: string,
): Promise<void> {
  await query('update fights set status = $1 where id = $2', [status, fightId]);
}

export async function updateEventSlotFight(
  eventSlotId: string,
  fightId: string,
): Promise<void> {
  await query('update event_slots set fight_id = $1 where id = $2', [fightId, eventSlotId]);
}

export async function rejectPendingOffersForEventSlot(
  eventSlotId: string,
  excludeFightId: string,
): Promise<void> {
  await query(
    'update offers set status = $1 where event_slot_id = $2 and fight_id != $3 and status = $4',
    ['rejected', eventSlotId, excludeFightId, 'pending'],
  );
}

export async function getAvailableOffersForFightByFighter(
  fightId: string,
  fighterId: string,
): Promise<OfferWithFightDetails[]> {
  const sql = `
    select 
      o.id,
      o.fight_id as "fightId",
      o.event_id as "eventId",
      o.event_slot_id as "eventSlotId",
      fp_join.user_id as "fighterId",
      pp_join.user_id as "ploId",
      o.amount,
      o.currency,
      o.status,
      o.created_at as "createdAt",
      e.name as "eventName",
      es.start_time as "slotStartTime",
      u.email as "ploEmail",
      fpa.user_id as "fighterAId",
      fpb.user_id as "fighterBId",
      oa.status as "fighterAStatus",
      ob.status as "fighterBStatus"
    from offers o
    join events e on o.event_id = e.id
    join event_slots es on o.event_slot_id = es.id
    join plo_profiles pp_join on o.plo_profile_id = pp_join.id
    join users u on pp_join.user_id = u.id
    join fights f on o.fight_id = f.id
    join fighter_profiles fpa on f.fighter_a_profile_id = fpa.id
    join fighter_profiles fpb on f.fighter_b_profile_id = fpb.id
    join fighter_profiles fp_join on o.fighter_profile_id = fp_join.id
    join offers oa on oa.fight_id = f.id
      and oa.event_id = o.event_id
      and oa.event_slot_id = o.event_slot_id
      and oa.plo_profile_id = o.plo_profile_id
      and oa.fighter_profile_id = f.fighter_a_profile_id
    join offers ob on ob.fight_id = f.id
      and ob.event_id = o.event_id
      and ob.event_slot_id = o.event_slot_id
      and ob.plo_profile_id = o.plo_profile_id
      and ob.fighter_profile_id = f.fighter_b_profile_id
    where o.fight_id = $1 
      and fp_join.user_id = $2
      and not (oa.status = 'rejected' or ob.status = 'rejected')
      and not (oa.status = 'accepted' and ob.status = 'accepted')
    order by o.created_at desc
  `;
  const r = await query<OfferWithFightDetails>(sql, [fightId, fighterId]);
  return r.rows;
}


