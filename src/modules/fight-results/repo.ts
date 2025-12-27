import { query } from '@src/db/client';
import type { FightResult, CreateResultFields, UpdateResultFields } from './model';

export async function create(fields: CreateResultFields): Promise<FightResult> {
  const r = await query<FightResult & { winner_name: string | null }>(
    `insert into fight_results (fight_id, winner_id, result_type, round_ended, time_ended, judge_scores)
     values ($1, $2, $3, $4, $5, $6)
     returning id, fight_id as "fightId", winner_id as "winnerId", result_type as "resultType", round_ended as "roundEnded", time_ended as "timeEnded", judge_scores as "judgeScores"`,
    [fields.fightId, fields.winnerId ?? null, fields.resultType ?? null, fields.roundEnded ?? null, fields.timeEnded ?? null, fields.judgeScores ? JSON.stringify(fields.judgeScores) : null],
  );
  const result = r.rows[0];
  let winnerName = null;
  if (result.winnerId) {
    const winnerRes = await query<{ first_name: string | null; last_name: string | null; nickname: string | null }>(
      `select fp.first_name, fp.last_name, fp.nickname
       from fighter_profiles fp
       where fp.id = $1`,
      [result.winnerId],
    );
    const winner = winnerRes.rows[0];
    if (winner) {
      winnerName = winner.nickname ?? `${winner.first_name ?? ''} ${winner.last_name ?? ''}`.trim() ?? null;
    }
  }
  return { ...result, winnerName };
}

export async function getByFightId(fightId: string): Promise<FightResult | null> {
  const r = await query<FightResult & { winner_name: string | null }>(
    `select 
      fr.id,
      fr.fight_id as "fightId",
      fr.winner_id as "winnerId",
      fr.result_type as "resultType",
      fr.round_ended as "roundEnded",
      fr.time_ended as "timeEnded",
      fr.judge_scores as "judgeScores"
     from fight_results fr
     where fr.fight_id = $1`,
    [fightId],
  );
  const result = r.rows[0];
  if (!result) return null;
  let winnerName = null;
  if (result.winnerId) {
    const winnerRes = await query<{ first_name: string | null; last_name: string | null; nickname: string | null }>(
      `select fp.first_name, fp.last_name, fp.nickname
       from fighter_profiles fp
       where fp.id = $1`,
      [result.winnerId],
    );
    const winner = winnerRes.rows[0];
    if (winner) {
      winnerName = winner.nickname ?? `${winner.first_name ?? ''} ${winner.last_name ?? ''}`.trim() ?? null;
    }
  }
  return { ...result, winnerName };
}

export async function getById(id: string): Promise<FightResult | null> {
  const r = await query<FightResult & { winner_name: string | null }>(
    `select 
      fr.id,
      fr.fight_id as "fightId",
      fr.winner_id as "winnerId",
      fr.result_type as "resultType",
      fr.round_ended as "roundEnded",
      fr.time_ended as "timeEnded",
      fr.judge_scores as "judgeScores"
     from fight_results fr
     where fr.id = $1`,
    [id],
  );
  const result = r.rows[0];
  if (!result) return null;
  let winnerName = null;
  if (result.winnerId) {
    const winnerRes = await query<{ first_name: string | null; last_name: string | null; nickname: string | null }>(
      `select fp.first_name, fp.last_name, fp.nickname
       from fighter_profiles fp
       where fp.id = $1`,
      [result.winnerId],
    );
    const winner = winnerRes.rows[0];
    if (winner) {
      winnerName = winner.nickname ?? `${winner.first_name ?? ''} ${winner.last_name ?? ''}`.trim() ?? null;
    }
  }
  return { ...result, winnerName };
}

export async function update(id: string, fields: UpdateResultFields): Promise<FightResult | null> {
  const updates: string[] = [];
  const values: unknown[] = [];
  let paramCount = 1;

  if (fields.winnerId !== undefined) {
    updates.push(`winner_id = $${paramCount++}`);
    values.push(fields.winnerId);
  }
  if (fields.resultType !== undefined) {
    updates.push(`result_type = $${paramCount++}`);
    values.push(fields.resultType);
  }
  if (fields.roundEnded !== undefined) {
    updates.push(`round_ended = $${paramCount++}`);
    values.push(fields.roundEnded);
  }
  if (fields.timeEnded !== undefined) {
    updates.push(`time_ended = $${paramCount++}`);
    values.push(fields.timeEnded);
  }
  if (fields.judgeScores !== undefined) {
    updates.push(`judge_scores = $${paramCount++}`);
    values.push(fields.judgeScores ? JSON.stringify(fields.judgeScores) : null);
  }

  if (updates.length === 0) {
    return getById(id);
  }

  values.push(id);
  const r = await query<FightResult & { winner_name: string | null }>(
    `update fight_results
     set ${updates.join(', ')}
     where id = $${paramCount}
     returning id, fight_id as "fightId", winner_id as "winnerId", result_type as "resultType", round_ended as "roundEnded", time_ended as "timeEnded", judge_scores as "judgeScores"`,
    values,
  );
  const result = r.rows[0];
  if (!result) return null;
  let winnerName = null;
  if (result.winnerId) {
    const winnerRes = await query<{ first_name: string | null; last_name: string | null; nickname: string | null }>(
      `select fp.first_name, fp.last_name, fp.nickname
       from fighter_profiles fp
       where fp.id = $1`,
      [result.winnerId],
    );
    const winner = winnerRes.rows[0];
    if (winner) {
      winnerName = winner.nickname ?? `${winner.first_name ?? ''} ${winner.last_name ?? ''}`.trim() ?? null;
    }
  }
  return { ...result, winnerName };
}

export async function deleteById(id: string): Promise<void> {
  await query('delete from fight_results where id = $1', [id]);
}

