import { query } from '@src/db/client';
import type { EventLocation, CreateLocationFields, UpdateLocationFields } from './model';

export async function create(fields: CreateLocationFields): Promise<EventLocation> {
  const r = await query<EventLocation>(
    `insert into event_locations (event_id, venue_name, venue_address, city, country, venue_capacity)
     values ($1, $2, $3, $4, $5, $6)
     returning id, event_id as "eventId", venue_name as "venueName", venue_address as "venueAddress", city, country, venue_capacity as "venueCapacity", updated_at as "updatedAt"`,
    [fields.eventId, fields.venueName ?? null, fields.venueAddress ?? null, fields.city ?? null, fields.country ?? null, fields.venueCapacity ?? null],
  );
  return r.rows[0];
}

export async function getByEventId(eventId: string): Promise<EventLocation | null> {
  const r = await query<EventLocation>(
    `select id, event_id as "eventId", venue_name as "venueName", venue_address as "venueAddress", city, country, venue_capacity as "venueCapacity", updated_at as "updatedAt"
     from event_locations
     where event_id = $1`,
    [eventId],
  );
  return r.rows[0] ?? null;
}

export async function getById(id: string): Promise<EventLocation | null> {
  const r = await query<EventLocation>(
    `select id, event_id as "eventId", venue_name as "venueName", venue_address as "venueAddress", city, country, venue_capacity as "venueCapacity", updated_at as "updatedAt"
     from event_locations
     where id = $1`,
    [id],
  );
  return r.rows[0] ?? null;
}

export async function update(id: string, fields: UpdateLocationFields): Promise<EventLocation | null> {
  const updates: string[] = [];
  const values: unknown[] = [];
  let paramCount = 1;

  if (fields.venueName !== undefined) {
    updates.push(`venue_name = $${paramCount++}`);
    values.push(fields.venueName);
  }
  if (fields.venueAddress !== undefined) {
    updates.push(`venue_address = $${paramCount++}`);
    values.push(fields.venueAddress);
  }
  if (fields.city !== undefined) {
    updates.push(`city = $${paramCount++}`);
    values.push(fields.city);
  }
  if (fields.country !== undefined) {
    updates.push(`country = $${paramCount++}`);
    values.push(fields.country);
  }
  if (fields.venueCapacity !== undefined) {
    updates.push(`venue_capacity = $${paramCount++}`);
    values.push(fields.venueCapacity);
  }

  if (updates.length === 0) {
    return getById(id);
  }

  updates.push(`updated_at = now()`);
  values.push(id);
  const r = await query<EventLocation>(
    `update event_locations
     set ${updates.join(', ')}
     where id = $${paramCount}
     returning id, event_id as "eventId", venue_name as "venueName", venue_address as "venueAddress", city, country, venue_capacity as "venueCapacity", updated_at as "updatedAt"`,
    values,
  );
  return r.rows[0] ?? null;
}

export async function deleteById(id: string): Promise<void> {
  await query('delete from event_locations where id = $1', [id]);
}

