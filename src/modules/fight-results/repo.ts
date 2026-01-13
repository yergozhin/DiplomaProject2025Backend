import { query } from '@src/db/client';
import type { FightResult, CreateResultFields, UpdateResultFields } from './model';

export async function create(fields: CreateResultFields): Promise<FightResult> {
  const result = await query<FightResult & { winner_name: string | null }>(
    'insert into fight_results (fight_id, winner_id, result_type, round_ended, time_ended, judge_scores) values ($1, $2, $3, $4, $5, $6) returning id, fight_id as "fightId", winner_id as "winnerId", result_type as "resultType", round_ended as "roundEnded", time_ended as "timeEnded", judge_scores as "judgeScores"',
    [fields.fightId, fields.winnerId ?? null, fields.resultType ?? null, fields.roundEnded ?? null, fields.timeEnded ?? null, fields.judgeScores ? JSON.stringify(fields.judgeScores) : null],
  );
  const res = result.rows[0];
  let winnerName = null;
  if (res.winnerId) {
    const winnerRes = await query<{ first_name: string | null, last_name: string | null, nickname: string | null }>(
      'select fp.first_name, fp.last_name, fp.nickname from fighter_profiles fp where fp.id = $1',
      [res.winnerId],
    );
    const winner = winnerRes.rows[0];
    if (winner) {
      winnerName = winner.nickname ?? `${winner.first_name ?? ''} ${winner.last_name ?? ''}`.trim() ?? null;
    }
  }
  return { ...res, winnerName };
}

export async function getByFightId(fightId: string): Promise<FightResult | null> {
  const res = await query<FightResult & { winner_name: string | null }>(
    'select fr.id, fr.fight_id as "fightId", fr.winner_id as "winnerId", fr.result_type as "resultType", fr.round_ended as "roundEnded", fr.time_ended as "timeEnded", fr.judge_scores as "judgeScores" from fight_results fr where fr.fight_id = $1',
    [fightId],
  );
  const result = res.rows[0];
  if (!result) return null;
  let winnerName = null;
  if (result.winnerId) {
    const winnerRes = await query<{ first_name: string | null, last_name: string | null, nickname: string | null }>(
      'select fp.first_name, fp.last_name, fp.nickname from fighter_profiles fp where fp.id = $1',
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
  const result = await query<FightResult & { winner_name: string | null }>(
    'select fr.id, fr.fight_id as "fightId", fr.winner_id as "winnerId", fr.result_type as "resultType", fr.round_ended as "roundEnded", fr.time_ended as "timeEnded", fr.judge_scores as "judgeScores" from fight_results fr where fr.id = $1',
    [id],
  );
  const res = result.rows[0];
  if (!res) return null;
  let winnerName = null;
  if (res.winnerId) {
    const winnerRes = await query<{ first_name: string | null, last_name: string | null, nickname: string | null }>(
      'select fp.first_name, fp.last_name, fp.nickname from fighter_profiles fp where fp.id = $1',
      [res.winnerId],
    );
    const winner = winnerRes.rows[0];
    if (winner) {
      winnerName = winner.nickname ?? `${winner.first_name ?? ''} ${winner.last_name ?? ''}`.trim() ?? null;
    }
  }
  return { ...res, winnerName };
}

export async function update(id: string, fields: UpdateResultFields): Promise<FightResult | null> {
  const updates: Record<string, unknown> = {};
  
  if (fields.winnerId !== undefined) updates.winner_id = fields.winnerId;
  if (fields.resultType !== undefined) updates.result_type = fields.resultType;
  if (fields.roundEnded !== undefined) updates.round_ended = fields.roundEnded;
  if (fields.timeEnded !== undefined) updates.time_ended = fields.timeEnded;
  if (fields.judgeScores !== undefined) {
    updates.judge_scores = fields.judgeScores ? JSON.stringify(fields.judgeScores) : null;
  }
  
  if (Object.keys(updates).length === 0) {
    return getById(id);
  }
  
  const setParts: string[] = [];
  const values: unknown[] = [];
  let counter = 1;
  
  for (const [key, val] of Object.entries(updates)) {
    setParts.push(`${key} = $${counter}`);
    values.push(val);
    counter++;
  }
  
  values.push(id);
  const result = await query<FightResult & { winner_name: string | null }>(
    `update fight_results set ${setParts.join(', ')} where id = $${counter} returning id, fight_id as "fightId", winner_id as "winnerId", result_type as "resultType", round_ended as "roundEnded", time_ended as "timeEnded", judge_scores as "judgeScores"`,
    values,
  );
  const res = result.rows[0];
  if (!res) return null;
  let winnerName = null;
  if (res.winnerId) {
    const winnerRes = await query<{ first_name: string | null, last_name: string | null, nickname: string | null }>(
      'select fp.first_name, fp.last_name, fp.nickname from fighter_profiles fp where fp.id = $1',
      [res.winnerId],
    );
    const winner = winnerRes.rows[0];
    if (winner) {
      winnerName = winner.nickname ?? `${winner.first_name ?? ''} ${winner.last_name ?? ''}`.trim() ?? null;
    }
  }
  return { ...res, winnerName };
}

export async function deleteById(id: string): Promise<void> {
  await query('delete from fight_results where id = $1', [id]);
}

