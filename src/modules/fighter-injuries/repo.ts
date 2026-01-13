import { query } from '@src/db/client';
import type { FighterInjury, CreateInjuryFields, UpdateInjuryFields } from './model';

export async function create(fields: CreateInjuryFields): Promise<FighterInjury> {
  const result = await query<FighterInjury>(
    'with inserted as (insert into fighter_injuries (fighter_id, injury_type, injury_description, injury_date, recovery_status, medical_notes) values ((select id from fighter_profiles where user_id = $1), $2, $3, $4, $5, $6) returning id, fighter_id, injury_type, injury_description, injury_date, recovery_status, medical_notes, updated_at) select i.id, fp.user_id as "fighterId", i.injury_type as "injuryType", i.injury_description as "injuryDescription", i.injury_date as "injuryDate", i.recovery_status as "recoveryStatus", i.medical_notes as "medicalNotes", i.updated_at as "updatedAt" from inserted i join fighter_profiles fp on i.fighter_id = fp.id',
    [fields.fighterId, fields.injuryType, fields.injuryDescription ?? null, fields.injuryDate ?? null, fields.recoveryStatus ?? null, fields.medicalNotes ?? null],
  );
  return result.rows[0];
}

export function getByFighterId(fighterId: string): Promise<FighterInjury[]> {
  return query<FighterInjury>(
    'select fi.id, fp.user_id as "fighterId", fi.injury_type as "injuryType", fi.injury_description as "injuryDescription", fi.injury_date as "injuryDate", fi.recovery_status as "recoveryStatus", fi.medical_notes as "medicalNotes", fi.updated_at as "updatedAt" from fighter_injuries fi join fighter_profiles fp on fi.fighter_id = fp.id where fp.user_id = $1 order by fi.injury_date desc nulls last, fi.updated_at desc',
    [fighterId],
  ).then(res => res.rows);
}

export async function getById(id: string): Promise<FighterInjury | null> {
  const result = await query<FighterInjury>(
    'select fi.id, fp.user_id as "fighterId", fi.injury_type as "injuryType", fi.injury_description as "injuryDescription", fi.injury_date as "injuryDate", fi.recovery_status as "recoveryStatus", fi.medical_notes as "medicalNotes", fi.updated_at as "updatedAt" from fighter_injuries fi join fighter_profiles fp on fi.fighter_id = fp.id where fi.id = $1',
    [id],
  );
  return result.rows[0] ?? null;
}

export async function update(id: string, fields: UpdateInjuryFields): Promise<FighterInjury | null> {
  const fieldMap: Record<string, unknown> = {};
  
  if (fields.injuryType !== undefined) fieldMap.injury_type = fields.injuryType;
  if (fields.injuryDescription !== undefined) fieldMap.injury_description = fields.injuryDescription;
  if (fields.injuryDate !== undefined) fieldMap.injury_date = fields.injuryDate;
  if (fields.recoveryStatus !== undefined) fieldMap.recovery_status = fields.recoveryStatus;
  if (fields.medicalNotes !== undefined) fieldMap.medical_notes = fields.medicalNotes;
  
  if (Object.keys(fieldMap).length === 0) {
    return getById(id);
  }
  
  const updateExpressions: string[] = [];
  const paramList: unknown[] = [];
  let paramNum = 1;
  
  const keys = Object.keys(fieldMap);
  for (const dbField of keys) {
    updateExpressions.push(`${dbField} = $${paramNum}`);
    paramList.push(fieldMap[dbField]);
    paramNum++;
  }
  
  updateExpressions.push('updated_at = now()');
  paramList.push(id);
  
  const result = await query<FighterInjury>(
    `update fighter_injuries fi set ${updateExpressions.join(', ')} from fighter_profiles fp where fi.id = $${paramNum} and fi.fighter_id = fp.id returning fi.id, fp.user_id as "fighterId", fi.injury_type as "injuryType", fi.injury_description as "injuryDescription", fi.injury_date as "injuryDate", fi.recovery_status as "recoveryStatus", fi.medical_notes as "medicalNotes", fi.updated_at as "updatedAt"`,
    paramList,
  );
  return result.rows[0] ?? null;
}

export async function deleteById(id: string): Promise<void> {
  await query('delete from fighter_injuries where id = $1', [id]);
}

