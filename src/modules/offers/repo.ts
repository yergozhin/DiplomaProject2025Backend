import { query } from '@src/db/client';
import { Offer } from './model';

export async function all(): Promise<Offer[]> {
  const r = await query('select id, fight_id as "fightId", event_id as "eventId", event_slot_id as "eventSlotId", fighter_id as "fighterId", plo_id as "ploId", created_at as "createdAt" from offers order by created_at desc');
  return r.rows as Offer[];
}

export async function create(fightId: string, eventId: string, eventSlotId: string, fighterId: string, ploId: string): Promise<Offer> {
  const r = await query('insert into offers (fight_id, event_id, event_slot_id, fighter_id, plo_id) values ($1, $2, $3, $4, $5) returning id, fight_id as "fightId", event_id as "eventId", event_slot_id as "eventSlotId", fighter_id as "fighterId", plo_id as "ploId", created_at as "createdAt"', [fightId, eventId, eventSlotId, fighterId, ploId]);
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


