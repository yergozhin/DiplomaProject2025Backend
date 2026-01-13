import { query } from '@src/db/client';
import type { FightStatistic, CreateStatisticFields, UpdateStatisticFields } from './model';

export const create = async (fields: CreateStatisticFields): Promise<FightStatistic> => {
  const result = await query<FightStatistic & { fighter_name: string | null }>(
    `with inserted as (insert into fight_statistics (fight_id, fighter_id, strikes_landed, strikes_attempted, takedowns_landed, takedowns_attempted, submission_attempts, control_time_seconds) values ($1, (select id from fighter_profiles where user_id = $2), $3, $4, $5, $6, $7, $8) returning id, fight_id, fighter_id, strikes_landed, strikes_attempted, takedowns_landed, takedowns_attempted, submission_attempts, control_time_seconds) select i.id, i.fight_id as "fightId", fp.user_id as "fighterId", i.strikes_landed as "strikesLanded", i.strikes_attempted as "strikesAttempted", i.takedowns_landed as "takedownsLanded", i.takedowns_attempted as "takedownsAttempted", i.submission_attempts as "submissionAttempts", i.control_time_seconds as "controlTimeSeconds", COALESCE(fp.nickname, fp.first_name || ' ' || fp.last_name) as fighter_name from inserted i join fighter_profiles fp on i.fighter_id = fp.id`,
    [fields.fightId, fields.fighterId, fields.strikesLanded || 0, fields.strikesAttempted || 0, fields.takedownsLanded || 0, fields.takedownsAttempted || 0, fields.submissionAttempts || 0, fields.controlTimeSeconds || 0],
  );
  const stat = result.rows[0];
  return { ...stat, fighterName: stat.fighter_name };
};

export async function getByFightId(fightId: string): Promise<FightStatistic[]> {
  const res = await query<FightStatistic & { fighter_name: string | null }>(
    `select fs.id, fs.fight_id as "fightId", fp.user_id as "fighterId", fs.strikes_landed as "strikesLanded", fs.strikes_attempted as "strikesAttempted", fs.takedowns_landed as "takedownsLanded", fs.takedowns_attempted as "takedownsAttempted", fs.submission_attempts as "submissionAttempts", fs.control_time_seconds as "controlTimeSeconds", COALESCE(fp.nickname, fp.first_name || ' ' || fp.last_name) as fighter_name from fight_statistics fs join fighter_profiles fp on fs.fighter_id = fp.id where fs.fight_id = $1`,
    [fightId],
  );
  const stats = [];
  for (let i = 0; i < res.rows.length; i++) {
    stats.push({ ...res.rows[i], fighterName: res.rows[i].fighter_name });
  }
  return stats;
}

export async function getByFighterId(fighterId: string): Promise<FightStatistic[]> {
  const result = await query<FightStatistic & { fighter_name: string | null }>(
    `select fs.id, fs.fight_id as "fightId", fp.user_id as "fighterId", fs.strikes_landed as "strikesLanded", fs.strikes_attempted as "strikesAttempted", fs.takedowns_landed as "takedownsLanded", fs.takedowns_attempted as "takedownsAttempted", fs.submission_attempts as "submissionAttempts", fs.control_time_seconds as "controlTimeSeconds", COALESCE(fp.nickname, fp.first_name || ' ' || fp.last_name) as fighter_name from fight_statistics fs join fighter_profiles fp on fs.fighter_id = fp.id where fp.user_id = $1 order by fs.fight_id desc`,
    [fighterId],
  );
  const stats = [];
  for (let i = 0; i < result.rows.length; i++) {
    stats.push({ ...result.rows[i], fighterName: result.rows[i].fighter_name });
  }
  return stats;
}

export async function getById(id: string): Promise<FightStatistic | null> {
  const res = await query<FightStatistic & { fighter_name: string | null }>(
    `select fs.id, fs.fight_id as "fightId", fp.user_id as "fighterId", fs.strikes_landed as "strikesLanded", fs.strikes_attempted as "strikesAttempted", fs.takedowns_landed as "takedownsLanded", fs.takedowns_attempted as "takedownsAttempted", fs.submission_attempts as "submissionAttempts", fs.control_time_seconds as "controlTimeSeconds", COALESCE(fp.nickname, fp.first_name || ' ' || fp.last_name) as fighter_name from fight_statistics fs join fighter_profiles fp on fs.fighter_id = fp.id where fs.id = $1`,
    [id],
  );
  const stat = res.rows[0];
  if (!stat) return null;
  return { ...stat, fighterName: stat.fighter_name };
}

export async function update(id: string, fields: UpdateStatisticFields): Promise<FightStatistic | null> {
  const fieldMappings: Array<{ dbField: string; value: unknown }> = [];
  
  if (fields.strikesLanded !== undefined) fieldMappings.push({ dbField: 'strikes_landed', value: fields.strikesLanded });
  if (fields.strikesAttempted !== undefined) fieldMappings.push({ dbField: 'strikes_attempted', value: fields.strikesAttempted });
  if (fields.takedownsLanded !== undefined) fieldMappings.push({ dbField: 'takedowns_landed', value: fields.takedownsLanded });
  if (fields.takedownsAttempted !== undefined) fieldMappings.push({ dbField: 'takedowns_attempted', value: fields.takedownsAttempted });
  if (fields.submissionAttempts !== undefined) fieldMappings.push({ dbField: 'submission_attempts', value: fields.submissionAttempts });
  if (fields.controlTimeSeconds !== undefined) fieldMappings.push({ dbField: 'control_time_seconds', value: fields.controlTimeSeconds });
  
  if (fieldMappings.length === 0) {
    return getById(id);
  }
  
  const setExpressions: string[] = [];
  for (let i = 0; i < fieldMappings.length; i++) {
    setExpressions.push(`${fieldMappings[i].dbField} = $${i + 1}`);
  }
  const paramValues: unknown[] = [];
  for (let i = 0; i < fieldMappings.length; i++) {
    paramValues.push(fieldMappings[i].value);
  }
  paramValues.push(id);
  
  const result = await query<FightStatistic & { fighter_name: string | null }>(
    `update fight_statistics fs set ${setExpressions.join(', ')} from fighter_profiles fp where fs.id = $${paramValues.length} and fs.fighter_id = fp.id returning fs.id, fs.fight_id as "fightId", fp.user_id as "fighterId", fs.strikes_landed as "strikesLanded", fs.strikes_attempted as "strikesAttempted", fs.takedowns_landed as "takedownsLanded", fs.takedowns_attempted as "takedownsAttempted", fs.submission_attempts as "submissionAttempts", fs.control_time_seconds as "controlTimeSeconds", COALESCE(fp.nickname, fp.first_name || ' ' || fp.last_name) as fighter_name`,
    paramValues,
  );
  const stat = result.rows[0];
  if (!stat) return null;
  return { ...stat, fighterName: stat.fighter_name };
}

export async function deleteById(id: string): Promise<void> {
  await query('delete from fight_statistics where id = $1', [id]);
}

