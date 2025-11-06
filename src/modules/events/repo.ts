import { query } from '@src/db/client';
import { Event, EventSlot } from './model';

export async function all(): Promise<Event[]> {
  const r = await query('select id, name, plo_id as "ploId", created_at as "createdAt" from events order by created_at desc');
  return r.rows as Event[];
}

export async function create(ploId: string, name: string): Promise<Event> {
  const r = await query('insert into events (plo_id, name) values ($1, $2) returning id, name, plo_id as "ploId", created_at as "createdAt"', [ploId, name]);
  return r.rows[0];
}

export async function addSlot(eventId: string, startTime: string): Promise<EventSlot> {
  const r = await query('insert into event_slots (event_id, start_time) values ($1, $2) returning id, event_id as "eventId", start_time as "startTime", fight_id as "fightId"', [eventId, startTime]);
  return r.rows[0];
}

export async function getByPloId(ploId: string): Promise<any[]> {
  const events = await query('select id, name, plo_id as "ploId", created_at as "createdAt" from events where plo_id = $1 order by created_at desc', [ploId]);
  const result = [];
  for (const event of events.rows) {
    const slots = await query('select id, event_id as "eventId", start_time as "startTime", fight_id as "fightId" from event_slots where event_id = $1 order by start_time', [event.id]);
    result.push({ ...event, slots: slots.rows });
  }
  return result;
}

export async function getById(id: string): Promise<Event | null> {
  const r = await query('select id, name, plo_id as "ploId", created_at as "createdAt" from events where id = $1', [id]);
  return r.rows[0] || null;
}

export async function getAvailableSlots(eventId: string): Promise<EventSlot[]> {
  const r = await query('select id, event_id as "eventId", start_time as "startTime", fight_id as "fightId" from event_slots where event_id = $1 and fight_id is null order by start_time', [eventId]);
  return r.rows as EventSlot[];
}


