import { query } from '@src/db/client';
import type { MedicalClearance, CreateClearanceFields, UpdateClearanceFields } from './model';

export async function create(fields: CreateClearanceFields): Promise<MedicalClearance> {
  const result = await query<MedicalClearance>(
    'with inserted as (insert into medical_clearances (fighter_id, clearance_date, expiration_date, cleared_by, clearance_type, notes, status) values ((select id from fighter_profiles where user_id = $1), $2, $3, $4, $5, $6, $7) returning id, fighter_id, clearance_date, expiration_date, cleared_by, clearance_type, notes, status) select i.id, fp.user_id as "fighterId", i.clearance_date as "clearanceDate", i.expiration_date as "expirationDate", i.cleared_by as "clearedBy", i.clearance_type as "clearanceType", i.notes, i.status from inserted i join fighter_profiles fp on i.fighter_id = fp.id',
    [fields.fighterId, fields.clearanceDate, fields.expirationDate ?? null, fields.clearedBy ?? null, fields.clearanceType ?? null, fields.notes ?? null, fields.status ?? 'pending'],
  );
  return result.rows[0];
}

export const getByFighterId = async (fighterId: string): Promise<MedicalClearance[]> => {
  const res = await query<MedicalClearance>(
    'select mc.id, fp.user_id as "fighterId", mc.clearance_date as "clearanceDate", mc.expiration_date as "expirationDate", mc.cleared_by as "clearedBy", mc.clearance_type as "clearanceType", mc.notes, mc.status from medical_clearances mc join fighter_profiles fp on mc.fighter_id = fp.id where fp.user_id = $1 order by mc.clearance_date desc',
    [fighterId],
  );
  return res.rows;
};

export async function getById(id: string): Promise<MedicalClearance | null> {
  const result = await query<MedicalClearance>(
    'select mc.id, fp.user_id as "fighterId", mc.clearance_date as "clearanceDate", mc.expiration_date as "expirationDate", mc.cleared_by as "clearedBy", mc.clearance_type as "clearanceType", mc.notes, mc.status from medical_clearances mc join fighter_profiles fp on mc.fighter_id = fp.id where mc.id = $1',
    [id],
  );
  return result.rows[0] ?? null;
}

export async function update(id: string, fields: UpdateClearanceFields): Promise<MedicalClearance | null> {
  const updates: { field: string, value: unknown }[] = [];
  
  if (fields.clearanceDate !== undefined) updates.push({ field: 'clearance_date', value: fields.clearanceDate });
  if (fields.expirationDate !== undefined) updates.push({ field: 'expiration_date', value: fields.expirationDate });
  if (fields.clearedBy !== undefined) updates.push({ field: 'cleared_by', value: fields.clearedBy });
  if (fields.clearanceType !== undefined) updates.push({ field: 'clearance_type', value: fields.clearanceType });
  if (fields.notes !== undefined) updates.push({ field: 'notes', value: fields.notes });
  if (fields.status !== undefined) updates.push({ field: 'status', value: fields.status });
  
  if (updates.length === 0) {
    return getById(id);
  }
  
  const setClauses: string[] = [];
  for (const [i, update] of updates.entries()) {
    setClauses.push(`${update.field} = $${i + 1}`);
  }
  const values: unknown[] = [];
  for (const update of updates) {
    values.push(update.value);
  }
  values.push(id);
  
  const result = await query<MedicalClearance>(
    `update medical_clearances mc set ${setClauses.join(', ')} from fighter_profiles fp where mc.id = $${values.length} and mc.fighter_id = fp.id returning mc.id, fp.user_id as "fighterId", mc.clearance_date as "clearanceDate", mc.expiration_date as "expirationDate", mc.cleared_by as "clearedBy", mc.clearance_type as "clearanceType", mc.notes, mc.status`,
    values,
  );
  return result.rows[0] ?? null;
}

export async function deleteById(id: string): Promise<void> {
  await query('delete from medical_clearances where id = $1', [id]);
}

