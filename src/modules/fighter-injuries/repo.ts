import { query } from '@src/db/client';
import type { FighterInjury, CreateInjuryFields, UpdateInjuryFields } from './model';

export async function create(fields: CreateInjuryFields): Promise<FighterInjury> {
  const r = await query<FighterInjury>(
    `insert into fighter_injuries (fighter_id, injury_type, injury_description, injury_date, recovery_status, medical_notes)
     values ($1, $2, $3, $4, $5, $6)
     returning id, fighter_id as "fighterId", injury_type as "injuryType", injury_description as "injuryDescription", injury_date as "injuryDate", recovery_status as "recoveryStatus", medical_notes as "medicalNotes", updated_at as "updatedAt"`,
    [fields.fighterId, fields.injuryType, fields.injuryDescription ?? null, fields.injuryDate ?? null, fields.recoveryStatus ?? null, fields.medicalNotes ?? null],
  );
  return r.rows[0];
}

export async function getByFighterId(fighterId: string): Promise<FighterInjury[]> {
  const r = await query<FighterInjury>(
    `select id, fighter_id as "fighterId", injury_type as "injuryType", injury_description as "injuryDescription", injury_date as "injuryDate", recovery_status as "recoveryStatus", medical_notes as "medicalNotes", updated_at as "updatedAt"
     from fighter_injuries
     where fighter_id = $1
     order by injury_date desc nulls last, updated_at desc`,
    [fighterId],
  );
  return r.rows;
}

export async function getById(id: string): Promise<FighterInjury | null> {
  const r = await query<FighterInjury>(
    `select id, fighter_id as "fighterId", injury_type as "injuryType", injury_description as "injuryDescription", injury_date as "injuryDate", recovery_status as "recoveryStatus", medical_notes as "medicalNotes", updated_at as "updatedAt"
     from fighter_injuries
     where id = $1`,
    [id],
  );
  return r.rows[0] ?? null;
}

export async function update(id: string, fields: UpdateInjuryFields): Promise<FighterInjury | null> {
  const updates: string[] = [];
  const values: unknown[] = [];
  let paramCount = 1;

  if (fields.injuryType !== undefined) {
    updates.push(`injury_type = $${paramCount++}`);
    values.push(fields.injuryType);
  }
  if (fields.injuryDescription !== undefined) {
    updates.push(`injury_description = $${paramCount++}`);
    values.push(fields.injuryDescription);
  }
  if (fields.injuryDate !== undefined) {
    updates.push(`injury_date = $${paramCount++}`);
    values.push(fields.injuryDate);
  }
  if (fields.recoveryStatus !== undefined) {
    updates.push(`recovery_status = $${paramCount++}`);
    values.push(fields.recoveryStatus);
  }
  if (fields.medicalNotes !== undefined) {
    updates.push(`medical_notes = $${paramCount++}`);
    values.push(fields.medicalNotes);
  }

  if (updates.length === 0) {
    return getById(id);
  }

  updates.push(`updated_at = now()`);
  values.push(id);
  const r = await query<FighterInjury>(
    `update fighter_injuries
     set ${updates.join(', ')}
     where id = $${paramCount}
     returning id, fighter_id as "fighterId", injury_type as "injuryType", injury_description as "injuryDescription", injury_date as "injuryDate", recovery_status as "recoveryStatus", medical_notes as "medicalNotes", updated_at as "updatedAt"`,
    values,
  );
  return r.rows[0] ?? null;
}

export async function deleteById(id: string): Promise<void> {
  await query('delete from fighter_injuries where id = $1', [id]);
}

