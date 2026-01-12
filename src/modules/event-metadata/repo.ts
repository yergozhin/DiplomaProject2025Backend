import { query } from '@src/db/client';
import type { EventMetadata, CreateMetadataFields, UpdateMetadataFields } from './model';

export function create(fields: CreateMetadataFields): Promise<EventMetadata> {
  return query<EventMetadata>(
    `insert into event_metadata (event_id, poster_image, ticket_link) values ($1, $2, $3) returning id, event_id as "eventId", poster_image as "posterImage", ticket_link as "ticketLink", updated_at as "updatedAt"`,
    [fields.eventId, fields.posterImage || null, fields.ticketLink || null],
  ).then(result => result.rows[0]);
}

export async function getByEventId(eventId: string): Promise<EventMetadata | null> {
  const res = await query<EventMetadata>(
    `select id, event_id as "eventId", poster_image as "posterImage", ticket_link as "ticketLink", updated_at as "updatedAt" from event_metadata where event_id = $1`,
    [eventId],
  );
  return res.rows[0] || null;
}

export async function getById(id: string): Promise<EventMetadata | null> {
  const result = await query<EventMetadata>(
    `select id, event_id as "eventId", poster_image as "posterImage", ticket_link as "ticketLink", updated_at as "updatedAt" from event_metadata where id = $1`,
    [id],
  );
  return result.rows[0] || null;
}

export async function update(id: string, fields: UpdateMetadataFields): Promise<EventMetadata | null> {
  const changes: Record<string, unknown> = {};
  
  if (fields.posterImage !== undefined) {
    changes.poster_image = fields.posterImage;
  }
  if (fields.ticketLink !== undefined) {
    changes.ticket_link = fields.ticketLink;
  }
  
  if (Object.keys(changes).length === 0) {
    return getById(id);
  }
  
  const setClauses: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;
  
  const keys = Object.keys(changes);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    setClauses.push(`${key} = $${paramIndex}`);
    params.push(changes[key]);
    paramIndex++;
  }
  
  setClauses.push('updated_at = now()');
  params.push(id);
  
  const result = await query<EventMetadata>(
    `update event_metadata set ${setClauses.join(', ')} where id = $${paramIndex} returning id, event_id as "eventId", poster_image as "posterImage", ticket_link as "ticketLink", updated_at as "updatedAt"`,
    params,
  );
  return result.rows[0] || null;
}

export async function deleteById(id: string): Promise<void> {
  await query('delete from event_metadata where id = $1', [id]);
}

