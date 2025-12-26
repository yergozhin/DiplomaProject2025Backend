import { query } from '@src/db/client';
import type { EventMetadata, CreateMetadataFields, UpdateMetadataFields } from './model';

export async function create(fields: CreateMetadataFields): Promise<EventMetadata> {
  const r = await query<EventMetadata>(
    `insert into event_metadata (event_id, poster_image, ticket_link)
     values ($1, $2, $3)
     returning id, event_id as "eventId", poster_image as "posterImage", ticket_link as "ticketLink", updated_at as "updatedAt"`,
    [fields.eventId, fields.posterImage ?? null, fields.ticketLink ?? null],
  );
  return r.rows[0];
}

export async function getByEventId(eventId: string): Promise<EventMetadata | null> {
  const r = await query<EventMetadata>(
    `select id, event_id as "eventId", poster_image as "posterImage", ticket_link as "ticketLink", updated_at as "updatedAt"
     from event_metadata
     where event_id = $1`,
    [eventId],
  );
  return r.rows[0] || null;
}

export async function getById(id: string): Promise<EventMetadata | null> {
  const r = await query<EventMetadata>(
    `select id, event_id as "eventId", poster_image as "posterImage", ticket_link as "ticketLink", updated_at as "updatedAt"
     from event_metadata
     where id = $1`,
    [id],
  );
  return r.rows[0] || null;
}

export async function update(id: string, fields: UpdateMetadataFields): Promise<EventMetadata | null> {
  const updates: string[] = [];
  const values: unknown[] = [];
  let paramCount = 1;

  if (fields.posterImage !== undefined) {
    updates.push(`poster_image = $${paramCount++}`);
    values.push(fields.posterImage);
  }
  if (fields.ticketLink !== undefined) {
    updates.push(`ticket_link = $${paramCount++}`);
    values.push(fields.ticketLink);
  }

  if (updates.length === 0) {
    return getById(id);
  }

  updates.push(`updated_at = now()`);
  values.push(id);
  const r = await query<EventMetadata>(
    `update event_metadata
     set ${updates.join(', ')}
     where id = $${paramCount}
     returning id, event_id as "eventId", poster_image as "posterImage", ticket_link as "ticketLink", updated_at as "updatedAt"`,
    values,
  );
  return r.rows[0] || null;
}

export async function deleteById(id: string): Promise<void> {
  await query('delete from event_metadata where id = $1', [id]);
}

