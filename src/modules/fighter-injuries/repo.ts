import { query } from '@src/db/client';
import type { FighterInjury, CreateInjuryFields, UpdateInjuryFields } from './model';

export async function create(fields: CreateInjuryFields): Promise<FighterInjury> {
  const r = await query<FighterInjury>(
    `with inserted as (
      insert into fighter_injuries (fighter_id, injury_type, injury_description, injury_date, recovery_status, medical_notes)
      values ((select id from fighter_profiles where user_id = $1), $2, $3, $4, $5, $6)
      returning id, fighter_id, injury_type, injury_description, injury_date, recovery_status, medical_notes, updated_at
    )
    select i.id, fp.user_id as "fighterId", i.injury_type as "injuryType", i.injury_description as "injuryDescription", i.injury_date as "injuryDate", i.recovery_status as "recoveryStatus", i.medical_notes as "medicalNotes", i.updated_at as "updatedAt"
    from inserted i
    join fighter_profiles fp on i.fighter_id = fp.id`,
    [fields.fighterId, fields.injuryType, fields.injuryDescription ?? null, fields.injuryDate ?? null, fields.recoveryStatus ?? null, fields.medicalNotes ?? null],
  );
  return r.rows[0];
}

export async function getByFighterId(fighterId: string): Promise<FighterInjury[]> {
  const r = await query<FighterInjury>(
    `select fi.id, fp.user_id as "fighterId", fi.injury_type as "injuryType", fi.injury_description as "injuryDescription", fi.injury_date as "injuryDate", fi.recovery_status as "recoveryStatus", fi.medical_notes as "medicalNotes", fi.updated_at as "updatedAt"
     from fighter_injuries fi
     join fighter_profiles fp on fi.fighter_id = fp.id
     where fp.user_id = $1
     order by fi.injury_date desc nulls last, fi.updated_at desc`,
    [fighterId],
  );
  return r.rows;
}

export async function getById(id: string): Promise<FighterInjury | null> {
  const r = await query<FighterInjury>(
    `select fi.id, fp.user_id as "fighterId", fi.injury_type as "injuryType", fi.injury_description as "injuryDescription", fi.injury_date as "injuryDate", fi.recovery_status as "recoveryStatus", fi.medical_notes as "medicalNotes", fi.updated_at as "updatedAt"
     from fighter_injuries fi
     join fighter_profiles fp on fi.fighter_id = fp.id
     where fi.id = $1`,
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

  updates.push('updated_at = now()');
  values.push(id);
  const r = await query<FighterInjury>(
    `update fighter_injuries fi
     set ${updates.join(', ')}
     from fighter_profiles fp
     where fi.id = $${paramCount} and fi.fighter_id = fp.id
     returning fi.id, fp.user_id as "fighterId", fi.injury_type as "injuryType", fi.injury_description as "injuryDescription", fi.injury_date as "injuryDate", fi.recovery_status as "recoveryStatus", fi.medical_notes as "medicalNotes", fi.updated_at as "updatedAt"`,
    values,
  );
  return r.rows[0] ?? null;
}

export async function deleteById(id: string): Promise<void> {
  await query('delete from fighter_injuries where id = $1', [id]);
}

