import { query } from '@src/db/client';
import type { OfferResponse, CreateResponseFields, UpdateResponseFields } from './model';

export async function create(fields: CreateResponseFields): Promise<OfferResponse> {
  const r = await query<OfferResponse & { fighter_name: string | null }>(
    `insert into offer_responses (offer_id, fighter_id, amount, currency, status)
     values ($1, $2, $3, $4, $5)
     returning id, offer_id as "offerId", fighter_id as "fighterId", amount, currency, status, responded_at as "respondedAt"`,
    [fields.offerId, fields.fighterId, fields.amount, fields.currency || 'USD', fields.status || 'pending'],
  );
  const response = r.rows[0];
  const fighterRes = await query<{ first_name: string | null; last_name: string | null; nickname: string | null }>(
    `select fp.first_name, fp.last_name, fp.nickname
     from fighter_profiles fp
     where fp.id = $1`,
    [response.fighterId],
  );
  const fighter = fighterRes.rows[0];
  const fighterName = fighter ? (fighter.nickname || `${fighter.first_name || ''} ${fighter.last_name || ''}`.trim() || null) : null;
  return { ...response, fighterName };
}

export async function getByOfferId(offerId: string): Promise<OfferResponse[]> {
  const r = await query<OfferResponse & { fighter_name: string | null }>(
    `select id, offer_id as "offerId", fighter_id as "fighterId", amount, currency, status, responded_at as "respondedAt"
     from offer_responses
     where offer_id = $1
     order by responded_at desc nulls last`,
    [offerId],
  );
  const responses = await Promise.all(r.rows.map(async (response) => {
    const fighterRes = await query<{ first_name: string | null; last_name: string | null; nickname: string | null }>(
      `select fp.first_name, fp.last_name, fp.nickname
       from fighter_profiles fp
       where fp.id = $1`,
      [response.fighterId],
    );
    const fighter = fighterRes.rows[0];
    const fighterName = fighter ? (fighter.nickname || `${fighter.first_name || ''} ${fighter.last_name || ''}`.trim() || null) : null;
    return { ...response, fighterName };
  }));
  return responses;
}

export async function getByFighterId(fighterId: string): Promise<OfferResponse[]> {
  const r = await query<OfferResponse & { fighter_name: string | null }>(
    `select id, offer_id as "offerId", fighter_id as "fighterId", amount, currency, status, responded_at as "respondedAt"
     from offer_responses
     where fighter_id = $1
     order by responded_at desc nulls last`,
    [fighterId],
  );
  const responses = await Promise.all(r.rows.map(async (response) => {
    const fighterRes = await query<{ first_name: string | null; last_name: string | null; nickname: string | null }>(
      `select fp.first_name, fp.last_name, fp.nickname
       from fighter_profiles fp
       where fp.id = $1`,
      [response.fighterId],
    );
    const fighter = fighterRes.rows[0];
    const fighterName = fighter ? (fighter.nickname || `${fighter.first_name || ''} ${fighter.last_name || ''}`.trim() || null) : null;
    return { ...response, fighterName };
  }));
  return responses;
}

export async function getById(id: string): Promise<OfferResponse | null> {
  const r = await query<OfferResponse & { fighter_name: string | null }>(
    `select id, offer_id as "offerId", fighter_id as "fighterId", amount, currency, status, responded_at as "respondedAt"
     from offer_responses
     where id = $1`,
    [id],
  );
  const response = r.rows[0];
  if (!response) return null;
  const fighterRes = await query<{ first_name: string | null; last_name: string | null; nickname: string | null }>(
    `select fp.first_name, fp.last_name, fp.nickname
     from fighter_profiles fp
     where fp.id = $1`,
    [response.fighterId],
  );
  const fighter = fighterRes.rows[0];
  const fighterName = fighter ? (fighter.nickname || `${fighter.first_name || ''} ${fighter.last_name || ''}`.trim() || null) : null;
  return { ...response, fighterName };
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
    `update offer_responses
     set ${updates.join(', ')}
     where id = $${paramCount}
     returning id, offer_id as "offerId", fighter_id as "fighterId", amount, currency, status, responded_at as "respondedAt"`,
    values,
  );
  const response = r.rows[0];
  if (!response) return null;
  const fighterRes = await query<{ first_name: string | null; last_name: string | null; nickname: string | null }>(
    `select fp.first_name, fp.last_name, fp.nickname
     from fighter_profiles fp
     where fp.id = $1`,
    [response.fighterId],
  );
  const fighter = fighterRes.rows[0];
  const fighterName = fighter ? (fighter.nickname || `${fighter.first_name || ''} ${fighter.last_name || ''}`.trim() || null) : null;
  return { ...response, fighterName };
}

export async function deleteById(id: string): Promise<void> {
  await query('delete from offer_responses where id = $1', [id]);
}

