import { query } from '@src/db/client';
import type { EventSponsor, CreateSponsorFields, UpdateSponsorFields } from './model';

export async function create(fields: CreateSponsorFields): Promise<EventSponsor> {
  const r = await query<EventSponsor>(
    `insert into event_sponsors (event_id, sponsor_name, sponsor_logo, sponsorship_level, sponsorship_amount)
     values ($1, $2, $3, $4, $5)
     returning id, event_id as "eventId", sponsor_name as "sponsorName", sponsor_logo as "sponsorLogo", sponsorship_level as "sponsorshipLevel", sponsorship_amount as "sponsorshipAmount"`,
    [fields.eventId, fields.sponsorName, fields.sponsorLogo ?? null, fields.sponsorshipLevel ?? null, fields.sponsorshipAmount ?? null],
  );
  return r.rows[0];
}

export async function getByEventId(eventId: string): Promise<EventSponsor[]> {
  const r = await query<EventSponsor>(
    `select id, event_id as "eventId", sponsor_name as "sponsorName", sponsor_logo as "sponsorLogo", sponsorship_level as "sponsorshipLevel", sponsorship_amount as "sponsorshipAmount"
     from event_sponsors
     where event_id = $1
     order by 
       case sponsorship_level
         when 'platinum' then 1
         when 'gold' then 2
         when 'silver' then 3
         when 'bronze' then 4
         else 5
       end,
       sponsor_name`,
    [eventId],
  );
  return r.rows;
}

export async function getById(id: string): Promise<EventSponsor | null> {
  const r = await query<EventSponsor>(
    `select id, event_id as "eventId", sponsor_name as "sponsorName", sponsor_logo as "sponsorLogo", sponsorship_level as "sponsorshipLevel", sponsorship_amount as "sponsorshipAmount"
     from event_sponsors
     where id = $1`,
    [id],
  );
  return r.rows[0] ?? null;
}

export async function update(id: string, fields: UpdateSponsorFields): Promise<EventSponsor | null> {
  const updates: string[] = [];
  const values: unknown[] = [];
  let paramCount = 1;

  if (fields.sponsorName !== undefined) {
    updates.push(`sponsor_name = $${paramCount++}`);
    values.push(fields.sponsorName);
  }
  if (fields.sponsorLogo !== undefined) {
    updates.push(`sponsor_logo = $${paramCount++}`);
    values.push(fields.sponsorLogo);
  }
  if (fields.sponsorshipLevel !== undefined) {
    updates.push(`sponsorship_level = $${paramCount++}`);
    values.push(fields.sponsorshipLevel);
  }
  if (fields.sponsorshipAmount !== undefined) {
    updates.push(`sponsorship_amount = $${paramCount++}`);
    values.push(fields.sponsorshipAmount);
  }

  if (updates.length === 0) {
    return getById(id);
  }

  values.push(id);
  const r = await query<EventSponsor>(
    `update event_sponsors
     set ${updates.join(', ')}
     where id = $${paramCount}
     returning id, event_id as "eventId", sponsor_name as "sponsorName", sponsor_logo as "sponsorLogo", sponsorship_level as "sponsorshipLevel", sponsorship_amount as "sponsorshipAmount"`,
    values,
  );
  return r.rows[0] ?? null;
}

export async function deleteById(id: string): Promise<void> {
  await query('delete from event_sponsors where id = $1', [id]);
}

