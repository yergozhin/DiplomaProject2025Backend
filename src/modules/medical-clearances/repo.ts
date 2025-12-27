import { query } from '@src/db/client';
import type { MedicalClearance, CreateClearanceFields, UpdateClearanceFields } from './model';

export async function create(fields: CreateClearanceFields): Promise<MedicalClearance> {
  const r = await query<MedicalClearance>(
    `insert into medical_clearances (fighter_id, clearance_date, expiration_date, cleared_by, clearance_type, notes)
     values ($1, $2, $3, $4, $5, $6)
     returning id, fighter_id as "fighterId", clearance_date as "clearanceDate", expiration_date as "expirationDate", cleared_by as "clearedBy", clearance_type as "clearanceType", notes`,
    [fields.fighterId, fields.clearanceDate, fields.expirationDate ?? null, fields.clearedBy ?? null, fields.clearanceType ?? null, fields.notes ?? null],
  );
  return r.rows[0];
}

export async function getByFighterId(fighterId: string): Promise<MedicalClearance[]> {
  const r = await query<MedicalClearance>(
    `select id, fighter_id as "fighterId", clearance_date as "clearanceDate", expiration_date as "expirationDate", cleared_by as "clearedBy", clearance_type as "clearanceType", notes
     from medical_clearances
     where fighter_id = $1
     order by clearance_date desc`,
    [fighterId],
  );
  return r.rows;
}

export async function getById(id: string): Promise<MedicalClearance | null> {
  const r = await query<MedicalClearance>(
    `select id, fighter_id as "fighterId", clearance_date as "clearanceDate", expiration_date as "expirationDate", cleared_by as "clearedBy", clearance_type as "clearanceType", notes
     from medical_clearances
     where id = $1`,
    [id],
  );
  return r.rows[0] ?? null;
}

export async function update(id: string, fields: UpdateClearanceFields): Promise<MedicalClearance | null> {
  const updates: string[] = [];
  const values: unknown[] = [];
  let paramCount = 1;

  if (fields.clearanceDate !== undefined) {
    updates.push(`clearance_date = $${paramCount++}`);
    values.push(fields.clearanceDate);
  }
  if (fields.expirationDate !== undefined) {
    updates.push(`expiration_date = $${paramCount++}`);
    values.push(fields.expirationDate);
  }
  if (fields.clearedBy !== undefined) {
    updates.push(`cleared_by = $${paramCount++}`);
    values.push(fields.clearedBy);
  }
  if (fields.clearanceType !== undefined) {
    updates.push(`clearance_type = $${paramCount++}`);
    values.push(fields.clearanceType);
  }
  if (fields.notes !== undefined) {
    updates.push(`notes = $${paramCount++}`);
    values.push(fields.notes);
  }

  if (updates.length === 0) {
    return getById(id);
  }

  values.push(id);
  const r = await query<MedicalClearance>(
    `update medical_clearances
     set ${updates.join(', ')}
     where id = $${paramCount}
     returning id, fighter_id as "fighterId", clearance_date as "clearanceDate", expiration_date as "expirationDate", cleared_by as "clearedBy", clearance_type as "clearanceType", notes`,
    values,
  );
  return r.rows[0] ?? null;
}

export async function deleteById(id: string): Promise<void> {
  await query('delete from medical_clearances where id = $1', [id]);
}

