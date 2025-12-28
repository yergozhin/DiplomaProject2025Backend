import { query } from '@src/db/client';
import type { FightStatistic, CreateStatisticFields, UpdateStatisticFields } from './model';

export async function create(fields: CreateStatisticFields): Promise<FightStatistic> {
  const r = await query<FightStatistic & { fighter_name: string | null }>(
    `with inserted as (
      insert into fight_statistics (fight_id, fighter_id, strikes_landed, strikes_attempted, takedowns_landed, takedowns_attempted, submission_attempts, control_time_seconds)
      values ($1, (select id from fighter_profiles where user_id = $2), $3, $4, $5, $6, $7, $8)
      returning id, fight_id, fighter_id, strikes_landed, strikes_attempted, takedowns_landed, takedowns_attempted, submission_attempts, control_time_seconds
    )
    select i.id, i.fight_id as "fightId", fp.user_id as "fighterId", i.strikes_landed as "strikesLanded", i.strikes_attempted as "strikesAttempted", i.takedowns_landed as "takedownsLanded", i.takedowns_attempted as "takedownsAttempted", i.submission_attempts as "submissionAttempts", i.control_time_seconds as "controlTimeSeconds",
           (fp.nickname ?? (fp.first_name || ' ' || fp.last_name) ?? null) as fighter_name
    from inserted i
    join fighter_profiles fp on i.fighter_id = fp.id`,
    [fields.fightId, fields.fighterId, fields.strikesLanded ?? 0, fields.strikesAttempted ?? 0, fields.takedownsLanded ?? 0, fields.takedownsAttempted ?? 0, fields.submissionAttempts ?? 0, fields.controlTimeSeconds ?? 0],
  );
  const stat = r.rows[0];
  return { ...stat, fighterName: stat.fighter_name };
}

export async function getByFightId(fightId: string): Promise<FightStatistic[]> {
  const r = await query<FightStatistic & { fighter_name: string | null }>(
    `select 
      fs.id,
      fs.fight_id as "fightId",
      fp.user_id as "fighterId",
      fs.strikes_landed as "strikesLanded",
      fs.strikes_attempted as "strikesAttempted",
      fs.takedowns_landed as "takedownsLanded",
      fs.takedowns_attempted as "takedownsAttempted",
      fs.submission_attempts as "submissionAttempts",
      fs.control_time_seconds as "controlTimeSeconds",
      (fp.nickname ?? (fp.first_name || ' ' || fp.last_name) ?? null) as fighter_name
     from fight_statistics fs
     join fighter_profiles fp on fs.fighter_id = fp.id
     where fs.fight_id = $1`,
    [fightId],
  );
  return r.rows.map(stat => ({ ...stat, fighterName: stat.fighter_name }));
}

export async function getByFighterId(fighterId: string): Promise<FightStatistic[]> {
  const r = await query<FightStatistic & { fighter_name: string | null }>(
    `select 
      fs.id,
      fs.fight_id as "fightId",
      fp.user_id as "fighterId",
      fs.strikes_landed as "strikesLanded",
      fs.strikes_attempted as "strikesAttempted",
      fs.takedowns_landed as "takedownsLanded",
      fs.takedowns_attempted as "takedownsAttempted",
      fs.submission_attempts as "submissionAttempts",
      fs.control_time_seconds as "controlTimeSeconds",
      (fp.nickname ?? (fp.first_name || ' ' || fp.last_name) ?? null) as fighter_name
     from fight_statistics fs
     join fighter_profiles fp on fs.fighter_id = fp.id
     where fp.user_id = $1
     order by fs.fight_id desc`,
    [fighterId],
  );
  return r.rows.map(stat => ({ ...stat, fighterName: stat.fighter_name }));
}

export async function getById(id: string): Promise<FightStatistic | null> {
  const r = await query<FightStatistic & { fighter_name: string | null }>(
    `select 
      fs.id,
      fs.fight_id as "fightId",
      fp.user_id as "fighterId",
      fs.strikes_landed as "strikesLanded",
      fs.strikes_attempted as "strikesAttempted",
      fs.takedowns_landed as "takedownsLanded",
      fs.takedowns_attempted as "takedownsAttempted",
      fs.submission_attempts as "submissionAttempts",
      fs.control_time_seconds as "controlTimeSeconds",
      (fp.nickname ?? (fp.first_name || ' ' || fp.last_name) ?? null) as fighter_name
     from fight_statistics fs
     join fighter_profiles fp on fs.fighter_id = fp.id
     where fs.id = $1`,
    [id],
  );
  const stat = r.rows[0];
  if (!stat) return null;
  return { ...stat, fighterName: stat.fighter_name };
}

export async function update(id: string, fields: UpdateStatisticFields): Promise<FightStatistic | null> {
  const updates: string[] = [];
  const values: unknown[] = [];
  let paramCount = 1;

  if (fields.strikesLanded !== undefined) {
    updates.push(`strikes_landed = $${paramCount++}`);
    values.push(fields.strikesLanded);
  }
  if (fields.strikesAttempted !== undefined) {
    updates.push(`strikes_attempted = $${paramCount++}`);
    values.push(fields.strikesAttempted);
  }
  if (fields.takedownsLanded !== undefined) {
    updates.push(`takedowns_landed = $${paramCount++}`);
    values.push(fields.takedownsLanded);
  }
  if (fields.takedownsAttempted !== undefined) {
    updates.push(`takedowns_attempted = $${paramCount++}`);
    values.push(fields.takedownsAttempted);
  }
  if (fields.submissionAttempts !== undefined) {
    updates.push(`submission_attempts = $${paramCount++}`);
    values.push(fields.submissionAttempts);
  }
  if (fields.controlTimeSeconds !== undefined) {
    updates.push(`control_time_seconds = $${paramCount++}`);
    values.push(fields.controlTimeSeconds);
  }

  if (updates.length === 0) {
    return getById(id);
  }

  values.push(id);
  const r = await query<FightStatistic & { fighter_name: string | null }>(
    `update fight_statistics fs
     set ${updates.join(', ')}
     from fighter_profiles fp
     where fs.id = $${paramCount} and fs.fighter_id = fp.id
     returning fs.id, fs.fight_id as "fightId", fp.user_id as "fighterId", fs.strikes_landed as "strikesLanded", fs.strikes_attempted as "strikesAttempted", fs.takedowns_landed as "takedownsLanded", fs.takedowns_attempted as "takedownsAttempted", fs.submission_attempts as "submissionAttempts", fs.control_time_seconds as "controlTimeSeconds",
            (fp.nickname ?? (fp.first_name || ' ' || fp.last_name) ?? null) as fighter_name`,
    values,
  );
  const stat = r.rows[0];
  if (!stat) return null;
  return { ...stat, fighterName: stat.fighter_name };
}

export async function deleteById(id: string): Promise<void> {
  await query('delete from fight_statistics where id = $1', [id]);
}

