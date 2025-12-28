import { query } from '@src/db/client';
import type { OfferResponse, CreateResponseFields, UpdateResponseFields } from './model';

export async function create(fields: CreateResponseFields): Promise<OfferResponse> {
  const r = await query<OfferResponse & { fighter_name: string | null }>(
    `with inserted as (
      insert into offer_responses (offer_id, fighter_id, amount, currency, status)
      values ($1, (select id from fighter_profiles where user_id = $2), $3, $4, $5)
      returning id, offer_id, fighter_id, amount, currency, status, responded_at
    )
    select i.id, i.offer_id as "offerId", fp.user_id as "fighterId", i.amount, i.currency, i.status, i.responded_at as "respondedAt",
           (fp.nickname ?? (fp.first_name || ' ' || fp.last_name) ?? null) as fighter_name
    from inserted i
    join fighter_profiles fp on i.fighter_id = fp.id`,
    [fields.offerId, fields.fighterId, fields.amount, fields.currency ?? 'USD', fields.status ?? 'pending'],
  );
  const response = r.rows[0];
  return { ...response, fighterName: response.fighter_name };
}

export async function getByOfferId(offerId: string): Promise<OfferResponse[]> {
  const r = await query<OfferResponse & { fighter_name: string | null }>(
    `select or_res.id, or_res.offer_id as "offerId", fp.user_id as "fighterId", or_res.amount, or_res.currency, or_res.status, or_res.responded_at as "respondedAt",
           (fp.nickname ?? (fp.first_name || ' ' || fp.last_name) ?? null) as fighter_name
     from offer_responses or_res
     join fighter_profiles fp on or_res.fighter_id = fp.id
     where or_res.offer_id = $1
     order by or_res.responded_at desc nulls last`,
    [offerId],
  );
  return r.rows.map(response => ({ ...response, fighterName: response.fighter_name }));
}

export async function getByFighterId(fighterId: string): Promise<OfferResponse[]> {
  const r = await query<OfferResponse & { fighter_name: string | null }>(
    `select or_res.id, or_res.offer_id as "offerId", fp.user_id as "fighterId", or_res.amount, or_res.currency, or_res.status, or_res.responded_at as "respondedAt",
           (fp.nickname ?? (fp.first_name || ' ' || fp.last_name) ?? null) as fighter_name
     from offer_responses or_res
     join fighter_profiles fp on or_res.fighter_id = fp.id
     where fp.user_id = $1
     order by or_res.responded_at desc nulls last`,
    [fighterId],
  );
  return r.rows.map(response => ({ ...response, fighterName: response.fighter_name }));
}

export async function getById(id: string): Promise<OfferResponse | null> {
  const r = await query<OfferResponse & { fighter_name: string | null }>(
    `select or_res.id, or_res.offer_id as "offerId", fp.user_id as "fighterId", or_res.amount, or_res.currency, or_res.status, or_res.responded_at as "respondedAt",
           (fp.nickname ?? (fp.first_name || ' ' || fp.last_name) ?? null) as fighter_name
     from offer_responses or_res
     join fighter_profiles fp on or_res.fighter_id = fp.id
     where or_res.id = $1`,
    [id],
  );
  const response = r.rows[0];
  if (!response) return null;
  return { ...response, fighterName: response.fighter_name };
}

export async function update(id: string, fields: UpdateResponseFields): Promise<OfferResponse | null> {
  const updates: string[] = [];
  const values: unknown[] = [];
  let paramCount = 1;

  if (fields.amount !== undefined) {
    updates.push(`amount = $${paramCount++}`);
    values.push(fields.amount);
  }
  if (fields.currency !== undefined) {
    updates.push(`currency = $${paramCount++}`);
    values.push(fields.currency);
  }
  if (fields.status !== undefined) {
    updates.push(`status = $${paramCount++}`);
    values.push(fields.status);
    if (fields.status !== 'pending') {
      updates.push(`responded_at = now()`);
    }
  }

  if (updates.length === 0) {
    return getById(id);
  }

  values.push(id);
  const r = await query<OfferResponse & { fighter_name: string | null }>(
    `update offer_responses or_res
     set ${updates.join(', ')}
     from fighter_profiles fp
     where or_res.id = $${paramCount} and or_res.fighter_id = fp.id
     returning or_res.id, or_res.offer_id as "offerId", fp.user_id as "fighterId", or_res.amount, or_res.currency, or_res.status, or_res.responded_at as "respondedAt",
            (fp.nickname ?? (fp.first_name || ' ' || fp.last_name) ?? null) as fighter_name`,
    values,
  );
  const response = r.rows[0];
  if (!response) return null;
  return { ...response, fighterName: response.fighter_name };
}

export async function deleteById(id: string): Promise<void> {
  await query('delete from offer_responses where id = $1', [id]);
}

