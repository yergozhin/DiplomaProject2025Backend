import { query } from '@src/db/client';
import type { EventLocation, CreateLocationFields, UpdateLocationFields } from './model';

export const create = async (fields: CreateLocationFields): Promise<EventLocation> => {
  const result = await query<EventLocation>(
    'insert into event_locations (event_id, venue_name, venue_address, city, country, venue_capacity) values ($1, $2, $3, $4, $5, $6) returning id, event_id as "eventId", venue_name as "venueName", venue_address as "venueAddress", city, country, venue_capacity as "venueCapacity", updated_at as "updatedAt"',
    [fields.eventId, fields.venueName ?? null, fields.venueAddress ?? null, fields.city ?? null, fields.country ?? null, fields.venueCapacity ?? null],
  );
  return result.rows[0];
};

export async function getByEventId(eventId: string): Promise<EventLocation | null> {
  const res = await query<EventLocation>(
    'select id, event_id as "eventId", venue_name as "venueName", venue_address as "venueAddress", city, country, venue_capacity as "venueCapacity", updated_at as "updatedAt" from event_locations where event_id = $1',
    [eventId],
  );
  return res.rows[0] ?? null;
}

export async function getById(id: string): Promise<EventLocation | null> {
  const result = await query<EventLocation>(
    'select id, event_id as "eventId", venue_name as "venueName", venue_address as "venueAddress", city, country, venue_capacity as "venueCapacity", updated_at as "updatedAt" from event_locations where id = $1',
    [id],
  );
  return result.rows[0] || null;
}

export async function update(id: string, fields: UpdateLocationFields): Promise<EventLocation | null> {
  const updateFields: string[] = [];
  const queryParams: unknown[] = [];
  
  if (fields.venueName !== undefined) {
    updateFields.push(`venue_name = $${queryParams.length + 1}`);
    queryParams.push(fields.venueName);
  }
  if (fields.venueAddress !== undefined) {
    updateFields.push(`venue_address = $${queryParams.length + 1}`);
    queryParams.push(fields.venueAddress);
  }
  if (fields.city !== undefined) {
    updateFields.push(`city = $${queryParams.length + 1}`);
    queryParams.push(fields.city);
  }
  if (fields.country !== undefined) {
    updateFields.push(`country = $${queryParams.length + 1}`);
    queryParams.push(fields.country);
  }
  if (fields.venueCapacity !== undefined) {
    updateFields.push(`venue_capacity = $${queryParams.length + 1}`);
    queryParams.push(fields.venueCapacity);
  }
  
  if (updateFields.length === 0) {
    return getById(id);
  }
  
  updateFields.push('updated_at = now()');
  queryParams.push(id);
  const paramCount = queryParams.length;
  const result = await query<EventLocation>(
    `update event_locations set ${updateFields.join(', ')} where id = $${paramCount} returning id, event_id as "eventId", venue_name as "venueName", venue_address as "venueAddress", city, country, venue_capacity as "venueCapacity", updated_at as "updatedAt"`,
    queryParams,
  );
  return result.rows[0] || null;
}

export async function deleteById(id: string): Promise<void> {
  await query('delete from event_locations where id = $1', [id]);
}

