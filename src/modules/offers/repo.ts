import { query } from '@src/db/client';
import { Offer } from './model';

export async function all(): Promise<Offer[]> {
  const r = await query('select id, fight_id as "fightId", event_id as "eventId", event_slot_id as "eventSlotId", fighter_id as "fighterId", plo_id as "ploId", amount, currency, status, created_at as "createdAt" from offers order by created_at desc');
  return r.rows as Offer[];
}

export async function create(fightId: string, eventId: string, eventSlotId: string, fighterId: string, ploId: string, amount: number, currency: string): Promise<Offer> {
  const r = await query('insert into offers (fight_id, event_id, event_slot_id, fighter_id, plo_id, amount, currency, status) values ($1, $2, $3, $4, $5, $6, $7, $8) returning id, fight_id as "fightId", event_id as "eventId", event_slot_id as "eventSlotId", fighter_id as "fighterId", plo_id as "ploId", amount, currency, status, created_at as "createdAt"', [fightId, eventId, eventSlotId, fighterId, ploId, amount, currency, 'pending']);
  return r.rows[0];
}

export async function getFightById(id: string): Promise<{ id: string; fighterAId: string; fighterBId: string; status: string } | null> {
  const r = await query('select id, fighter_a_id as "fighterAId", fighter_b_id as "fighterBId", status from fights where id=$1', [id]);
  return r.rows[0] || null;
}

export async function getEventById(id: string): Promise<{ id: string; ploId: string } | null> {
  const r = await query('select id, plo_id as "ploId" from events where id=$1', [id]);
  return r.rows[0] || null;
}

export async function getEventSlotById(id: string): Promise<{ id: string; eventId: string; fightId: string | null } | null> {
  const r = await query('select id, event_id as "eventId", fight_id as "fightId" from event_slots where id=$1', [id]);
  return r.rows[0] || null;
}

export async function findExistingOffer(fightId: string, ploId: string): Promise<Offer | null> {
  const r = await query('select id, fight_id as "fightId", event_id as "eventId", event_slot_id as "eventSlotId", fighter_id as "fighterId", plo_id as "ploId", amount, currency, status, created_at as "createdAt" from offers where fight_id=$1 and plo_id=$2 limit 1', [fightId, ploId]);
  return r.rows[0] || null;
}

export async function getById(id: string): Promise<Offer | null> {
  const r = await query('select id, fight_id as "fightId", event_id as "eventId", event_slot_id as "eventSlotId", fighter_id as "fighterId", plo_id as "ploId", amount, currency, status, created_at as "createdAt" from offers where id=$1', [id]);
  return r.rows[0] || null;
}

export async function deleteByFightAndPlo(fightId: string, ploId: string): Promise<void> {
  await query('delete from offers where fight_id=$1 and plo_id=$2', [fightId, ploId]);
}

export async function getAvailableByFighterId(fighterId: string): Promise<any[]> {
  const r = await query(`
    select 
      o.id,
      o.fight_id as "fightId",
      o.event_id as "eventId",
      o.event_slot_id as "eventSlotId",
      o.fighter_id as "fighterId",
      o.plo_id as "ploId",
      o.amount,
      o.currency,
      o.status,
      o.created_at as "createdAt",
      e.name as "eventName",
      es.start_time as "slotStartTime",
      u.email as "ploEmail",
      f.fighter_a_id as "fighterAId",
      f.fighter_b_id as "fighterBId",
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
    join users u on o.plo_id = u.id
    join fights f on o.fight_id = f.id
    join offers oa on oa.fight_id = f.id and oa.event_id = o.event_id and oa.event_slot_id = o.event_slot_id and oa.plo_id = o.plo_id and oa.fighter_id = f.fighter_a_id
    join offers ob on ob.fight_id = f.id and ob.event_id = o.event_id and ob.event_slot_id = o.event_slot_id and ob.plo_id = o.plo_id and ob.fighter_id = f.fighter_b_id
    where o.fighter_id = $1 
      and o.status = 'pending'
      and not (oa.status = 'rejected' or ob.status = 'rejected')
      and not (oa.status = 'accepted' and ob.status = 'accepted')
    order by o.created_at desc
  `, [fighterId]);
  return r.rows;
}

export async function updateStatus(id: string, fighterId: string, status: 'accepted' | 'rejected'): Promise<Offer | null> {
  const r = await query('update offers set status=$1 where id=$2 and fighter_id=$3 returning id, fight_id as "fightId", event_id as "eventId", event_slot_id as "eventSlotId", fighter_id as "fighterId", plo_id as "ploId", amount, currency, status, created_at as "createdAt"', [status, id, fighterId]);
  return r.rows[0] || null;
}

export async function getOffersForFightEventSlot(fightId: string, eventId: string, eventSlotId: string, ploId: string): Promise<Offer[]> {
  const r = await query('select id, fight_id as "fightId", event_id as "eventId", event_slot_id as "eventSlotId", fighter_id as "fighterId", plo_id as "ploId", amount, currency, status, created_at as "createdAt" from offers where fight_id=$1 and event_id=$2 and event_slot_id=$3 and plo_id=$4', [fightId, eventId, eventSlotId, ploId]);
  return r.rows as Offer[];
}

export async function updateFightStatus(fightId: string, status: string): Promise<void> {
  await query('update fights set status=$1 where id=$2', [status, fightId]);
}

export async function updateEventSlotFight(eventSlotId: string, fightId: string): Promise<void> {
  await query('update event_slots set fight_id=$1 where id=$2', [fightId, eventSlotId]);
}

export async function getAvailableOffersForFightByFighter(fightId: string, fighterId: string): Promise<any[]> {
  const r = await query(`
    select 
      o.id,
      o.fight_id as "fightId",
      o.event_id as "eventId",
      o.event_slot_id as "eventSlotId",
      o.fighter_id as "fighterId",
      o.plo_id as "ploId",
      o.amount,
      o.currency,
      o.status,
      o.created_at as "createdAt",
      e.name as "eventName",
      es.start_time as "slotStartTime",
      u.email as "ploEmail",
      f.fighter_a_id as "fighterAId",
      f.fighter_b_id as "fighterBId",
      oa.status as "fighterAStatus",
      ob.status as "fighterBStatus"
    from offers o
    join events e on o.event_id = e.id
    join event_slots es on o.event_slot_id = es.id
    join users u on o.plo_id = u.id
    join fights f on o.fight_id = f.id
    join offers oa on oa.fight_id = f.id and oa.event_id = o.event_id and oa.event_slot_id = o.event_slot_id and oa.plo_id = o.plo_id and oa.fighter_id = f.fighter_a_id
    join offers ob on ob.fight_id = f.id and ob.event_id = o.event_id and ob.event_slot_id = o.event_slot_id and ob.plo_id = o.plo_id and ob.fighter_id = f.fighter_b_id
    where o.fight_id = $1 
      and o.fighter_id = $2
      and not (oa.status = 'rejected' or ob.status = 'rejected')
      and not (oa.status = 'accepted' and ob.status = 'accepted')
    order by o.created_at desc
  `, [fightId, fighterId]);
  return r.rows;
}


