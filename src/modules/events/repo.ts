import { query } from '@src/db/client';
import type { Event, EventSlot, EventWithSlots } from './model';

const EVENT_SELECT = `
  id,
  name,
  plo_id as "ploId",
  created_at as "createdAt",
  event_name as "eventName",
  event_description as "eventDescription",
  venue_name as "venueName",
  venue_address as "venueAddress",
  city,
  country,
  venue_capacity as "venueCapacity",
  poster_image as "posterImage",
  ticket_link as "ticketLink",
  status,
  updated_at as "updatedAt"
`;

export async function all(): Promise<Event[]> {
  const r = await query<Event>(
    `select ${EVENT_SELECT}
       from events
   order by created_at desc`,
  );
  return r.rows;
}

export async function getPublished(): Promise<Event[]> {
  const r = await query<Event>(
    `select ${EVENT_SELECT}
       from events
      where status = 'published'
   order by created_at desc`,
  );
  return r.rows;
}

export async function create(ploId: string, name: string): Promise<Event> {
  const r = await query<Event>(
    `insert into events (plo_id, plo_profile_id, name, event_name, created_at, updated_at)
        values ($1, (select id from plo_profiles where user_id = $1), $2, $2, now(), now())
      returning ${EVENT_SELECT}`,
    [ploId, name],
  );
  return r.rows[0];
}

export async function addSlot(eventId: string, startTime: string): Promise<EventSlot> {
  const r = await query<EventSlot>(
    'insert into event_slots (event_id, start_time) values ($1, $2) returning id, event_id as "eventId", start_time as "startTime", fight_id as "fightId"',
    [eventId, startTime],
  );
  return r.rows[0];
}

export async function getByPloId(ploId: string): Promise<EventWithSlots[]> {
  const events = await query<Event>(
    `select ${EVENT_SELECT}
       from events
      where plo_id = $1
   order by created_at desc`,
    [ploId],
  );
  const result: EventWithSlots[] = [];
  for (const event of events.rows) {
    const slots = await query<EventSlot>(
      'select id, event_id as "eventId", start_time as "startTime", fight_id as "fightId" from event_slots where event_id = $1 order by start_time',
      [event.id],
    );
    result.push({ ...event, slots: slots.rows });
  }
  return result;
}

export async function getById(id: string): Promise<Event | null> {
  const r = await query<Event>(
    `select ${EVENT_SELECT}
       from events
      where id = $1`,
    [id],
  );
  return r.rows[0] || null;
}

export async function getByIdAndPloId(id: string, ploId: string): Promise<Event | null> {
  const r = await query<Event>(
    `select ${EVENT_SELECT}
       from events
      where id = $1
        and plo_id = $2`,
    [id, ploId],
  );
  return r.rows[0] || null;
}

export async function getSlotCount(eventId: string): Promise<number> {
  const r = await query<{ count: number }>(
    'select count(*)::int as count from event_slots where event_id = $1',
    [eventId],
  );
  return r.rows[0]?.count ?? 0;
}

export async function updateEventStatus(
  eventId: string,
  ploId: string,
  status: string,
): Promise<Event | null> {
  const r = await query<Event>(
    `
      update events
         set status = $3,
             updated_at = now()
       where id = $1
         and plo_id = $2
      returning ${EVENT_SELECT}
    `,
    [eventId, ploId, status],
  );
  return r.rows[0] || null;
}

export async function getAvailableSlots(eventId: string): Promise<EventSlot[]> {
  const r = await query<EventSlot>(
    'select id, event_id as "eventId", start_time as "startTime", fight_id as "fightId" from event_slots where event_id = $1 and fight_id is null order by start_time',
    [eventId],
  );
  return r.rows;
}


export interface EventUpdateFields {
  eventName: string | null;
  eventDescription: string | null;
  venueName: string | null;
  venueAddress: string | null;
  city: string | null;
  country: string | null;
  venueCapacity: number | null;
  posterImage: string | null;
  ticketLink: string | null;
}

export async function updateEvent(
  eventId: string,
  ploId: string,
  fields: EventUpdateFields,
): Promise<Event | null> {
  const r = await query<Event>(
    `
      update events
         set event_name = $3,
             event_description = $4,
             venue_name = $5,
             venue_address = $6,
             city = $7,
             country = $8,
             venue_capacity = $9,
             poster_image = $10,
             ticket_link = $11,
             updated_at = now()
       where id = $1
         and plo_id = $2
      returning ${EVENT_SELECT}
    `,
    [
      eventId,
      ploId,
      fields.eventName,
      fields.eventDescription,
      fields.venueName,
      fields.venueAddress,
      fields.city,
      fields.country,
      fields.venueCapacity,
      fields.posterImage,
      fields.ticketLink,
    ],
  );
  return r.rows[0] || null;
}


