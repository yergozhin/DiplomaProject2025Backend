import { query } from '@src/db/client';
import type { EventSponsor, CreateSponsorFields, UpdateSponsorFields } from './model';

export async function create(fields: CreateSponsorFields): Promise<EventSponsor> {
  const result = await query<EventSponsor>(
    'insert into event_sponsors (event_id, sponsor_name, sponsor_logo, sponsorship_level, sponsorship_amount) values ($1, $2, $3, $4, $5) returning id, event_id as "eventId", sponsor_name as "sponsorName", sponsor_logo as "sponsorLogo", sponsorship_level as "sponsorshipLevel", sponsorship_amount as "sponsorshipAmount"',
    [fields.eventId, fields.sponsorName, fields.sponsorLogo ?? null, fields.sponsorshipLevel ?? null, fields.sponsorshipAmount ?? null],
  );
  return result.rows[0];
}

export function getByEventId(eventId: string): Promise<EventSponsor[]> {
  return query<EventSponsor>(
    'select id, event_id as "eventId", sponsor_name as "sponsorName", sponsor_logo as "sponsorLogo", sponsorship_level as "sponsorshipLevel", sponsorship_amount as "sponsorshipAmount" from event_sponsors where event_id = $1 order by case sponsorship_level when \'platinum\' then 1 when \'gold\' then 2 when \'silver\' then 3 when \'bronze\' then 4 else 5 end, sponsor_name',
    [eventId],
  ).then(res => res.rows);
}

export async function getById(id: string): Promise<EventSponsor | null> {
  const result = await query<EventSponsor>(
    'select id, event_id as "eventId", sponsor_name as "sponsorName", sponsor_logo as "sponsorLogo", sponsorship_level as "sponsorshipLevel", sponsorship_amount as "sponsorshipAmount" from event_sponsors where id = $1',
    [id],
  );
  return result.rows[0] ?? null;
}

export async function update(id: string, fields: UpdateSponsorFields): Promise<EventSponsor | null> {
  const hasChanges = fields.sponsorName !== undefined || fields.sponsorLogo !== undefined || 
                     fields.sponsorshipLevel !== undefined || fields.sponsorshipAmount !== undefined;
  if (!hasChanges) {
    return getById(id);
  }
  
  const updates: string[] = [];
  const values: unknown[] = [];
  
  if (fields.sponsorName !== undefined) {
    updates.push('sponsor_name = $' + (values.length + 1));
    values.push(fields.sponsorName);
  }
  if (fields.sponsorLogo !== undefined) {
    updates.push('sponsor_logo = $' + (values.length + 1));
    values.push(fields.sponsorLogo);
  }
  if (fields.sponsorshipLevel !== undefined) {
    updates.push('sponsorship_level = $' + (values.length + 1));
    values.push(fields.sponsorshipLevel);
  }
  if (fields.sponsorshipAmount !== undefined) {
    updates.push('sponsorship_amount = $' + (values.length + 1));
    values.push(fields.sponsorshipAmount);
  }
  
  values.push(id);
  const sql = `update event_sponsors set ${updates.join(', ')} where id = $${values.length} returning id, event_id as "eventId", sponsor_name as "sponsorName", sponsor_logo as "sponsorLogo", sponsorship_level as "sponsorshipLevel", sponsorship_amount as "sponsorshipAmount"`;
  const result = await query<EventSponsor>(sql, values);
  return result.rows[0] ?? null;
}

export async function deleteById(id: string): Promise<void> {
  await query('delete from event_sponsors where id = $1', [id]);
}

