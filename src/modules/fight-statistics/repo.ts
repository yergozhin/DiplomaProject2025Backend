import { query } from '@src/db/client';
import type { FightStatistic, CreateStatisticFields, UpdateStatisticFields } from './model';

export async function create(fields: CreateStatisticFields): Promise<FightStatistic> {
  const r = await query<FightStatistic & { fighter_name: string | null }>(
    `insert into fight_statistics (fight_id, fighter_id, strikes_landed, strikes_attempted, takedowns_landed, takedowns_attempted, submission_attempts, control_time_seconds)
     values ($1, $2, $3, $4, $5, $6, $7, $8)
     returning id, fight_id as "fightId", fighter_id as "fighterId", strikes_landed as "strikesLanded", strikes_attempted as "strikesAttempted", takedowns_landed as "takedownsLanded", takedowns_attempted as "takedownsAttempted", submission_attempts as "submissionAttempts", control_time_seconds as "controlTimeSeconds"`,
    [fields.fightId, fields.fighterId, fields.strikesLanded ?? 0, fields.strikesAttempted ?? 0, fields.takedownsLanded ?? 0, fields.takedownsAttempted ?? 0, fields.submissionAttempts ?? 0, fields.controlTimeSeconds ?? 0],
  );
  const stat = r.rows[0];
  const fighterRes = await query<{ first_name: string | null; last_name: string | null; nickname: string | null }>(
    `select fp.first_name, fp.last_name, fp.nickname
     from fighter_profiles fp
     where fp.id = $1`,
    [stat.fighterId],
  );
  const fighter = fighterRes.rows[0];
  const fighterName = fighter ? (fighter.nickname || `${fighter.first_name || ''} ${fighter.last_name || ''}`.trim() || null) : null;
  return { ...stat, fighterName };
}

export async function getByFightId(fightId: string): Promise<FightStatistic[]> {
  const r = await query<FightStatistic & { fighter_name: string | null }>(
    `select 
      fs.id,
      fs.fight_id as "fightId",
      fs.fighter_id as "fighterId",
      fs.strikes_landed as "strikesLanded",
      fs.strikes_attempted as "strikesAttempted",
      fs.takedowns_landed as "takedownsLanded",
      fs.takedowns_attempted as "takedownsAttempted",
      fs.submission_attempts as "submissionAttempts",
      fs.control_time_seconds as "controlTimeSeconds"
     from fight_statistics fs
     where fs.fight_id = $1`,
    [fightId],
  );
  const stats = await Promise.all(r.rows.map(async (stat) => {
    const fighterRes = await query<{ first_name: string | null; last_name: string | null; nickname: string | null }>(
      `select fp.first_name, fp.last_name, fp.nickname
       from fighter_profiles fp
       where fp.id = $1`,
      [stat.fighterId],
    );
    const fighter = fighterRes.rows[0];
    const fighterName = fighter ? (fighter.nickname || `${fighter.first_name || ''} ${fighter.last_name || ''}`.trim() || null) : null;
    return { ...stat, fighterName };
  }));
  return stats;
}

export async function getByFighterId(fighterId: string): Promise<FightStatistic[]> {
  const r = await query<FightStatistic & { fighter_name: string | null }>(
    `select 
      fs.id,
      fs.fight_id as "fightId",
      fs.fighter_id as "fighterId",
      fs.strikes_landed as "strikesLanded",
      fs.strikes_attempted as "strikesAttempted",
      fs.takedowns_landed as "takedownsLanded",
      fs.takedowns_attempted as "takedownsAttempted",
      fs.submission_attempts as "submissionAttempts",
      fs.control_time_seconds as "controlTimeSeconds"
     from fight_statistics fs
     where fs.fighter_id = $1
     order by fs.fight_id desc`,
    [fighterId],
  );
  const stats = await Promise.all(r.rows.map(async (stat) => {
    const fighterRes = await query<{ first_name: string | null; last_name: string | null; nickname: string | null }>(
      `select fp.first_name, fp.last_name, fp.nickname
       from fighter_profiles fp
       where fp.id = $1`,
      [stat.fighterId],
    );
    const fighter = fighterRes.rows[0];
    const fighterName = fighter ? (fighter.nickname || `${fighter.first_name || ''} ${fighter.last_name || ''}`.trim() || null) : null;
    return { ...stat, fighterName };
  }));
  return stats;
}

export async function getById(id: string): Promise<FightStatistic | null> {
  const r = await query<FightStatistic & { fighter_name: string | null }>(
    `select 
      fs.id,
      fs.fight_id as "fightId",
      fs.fighter_id as "fighterId",
      fs.strikes_landed as "strikesLanded",
      fs.strikes_attempted as "strikesAttempted",
      fs.takedowns_landed as "takedownsLanded",
      fs.takedowns_attempted as "takedownsAttempted",
      fs.submission_attempts as "submissionAttempts",
      fs.control_time_seconds as "controlTimeSeconds"
     from fight_statistics fs
     where fs.id = $1`,
    [id],
  );
  const stat = r.rows[0];
  if (!stat) return null;
  const fighterRes = await query<{ first_name: string | null; last_name: string | null; nickname: string | null }>(
    `select fp.first_name, fp.last_name, fp.nickname
     from fighter_profiles fp
     where fp.id = $1`,
    [stat.fighterId],
  );
  const fighter = fighterRes.rows[0];
  const fighterName = fighter ? (fighter.nickname || `${fighter.first_name || ''} ${fighter.last_name || ''}`.trim() || null) : null;
  return { ...stat, fighterName };
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
    `update fight_statistics
     set ${updates.join(', ')}
     where id = $${paramCount}
     returning id, fight_id as "fightId", fighter_id as "fighterId", strikes_landed as "strikesLanded", strikes_attempted as "strikesAttempted", takedowns_landed as "takedownsLanded", takedowns_attempted as "takedownsAttempted", submission_attempts as "submissionAttempts", control_time_seconds as "controlTimeSeconds"`,
    values,
  );
  const stat = r.rows[0];
  if (!stat) return null;
  const fighterRes = await query<{ first_name: string | null; last_name: string | null; nickname: string | null }>(
    `select fp.first_name, fp.last_name, fp.nickname
     from fighter_profiles fp
     where fp.id = $1`,
    [stat.fighterId],
  );
  const fighter = fighterRes.rows[0];
  const fighterName = fighter ? (fighter.nickname || `${fighter.first_name || ''} ${fighter.last_name || ''}`.trim() || null) : null;
  return { ...stat, fighterName };
}

export async function deleteById(id: string): Promise<void> {
  await query('delete from fight_statistics where id = $1', [id]);
}

