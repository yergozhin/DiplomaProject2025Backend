import { query } from '@src/db/client';
import type { FighterRanking, CreateRankingFields, UpdateRankingFields } from './model';

export async function create(fields: CreateRankingFields): Promise<FighterRanking> {
  const r = await query<FighterRanking>(
    `insert into fighter_rankings (fighter_id, weight_class_id, ranking_position, ranking_points, ranking_date)
     values ($1, $2, $3, $4, $5)
     returning id, fighter_id as "fighterId", weight_class_id as "weightClassId", ranking_position as "rankingPosition", ranking_points as "rankingPoints", ranking_date as "rankingDate"`,
    [fields.fighterId, fields.weightClassId, fields.rankingPosition, fields.rankingPoints, fields.rankingDate],
  );
  const ranking = r.rows[0];
  const weightClassRes = await query<{ name: string }>(
    `select name from weight_classes where id = $1`,
    [ranking.weightClassId],
  );
  return { ...ranking, weightClassName: weightClassRes.rows[0]?.name ?? null };
}

export async function getByFighterId(fighterId: string): Promise<FighterRanking[]> {
  const r = await query<FighterRanking>(
    `select 
      fr.id,
      fr.fighter_id as "fighterId",
      fr.weight_class_id as "weightClassId",
      wc.name as "weightClassName",
      fr.ranking_position as "rankingPosition",
      fr.ranking_points as "rankingPoints",
      fr.ranking_date as "rankingDate"
     from fighter_rankings fr
     left join weight_classes wc on fr.weight_class_id = wc.id
     where fr.fighter_id = $1
     order by fr.ranking_date desc, fr.ranking_position nulls last`,
    [fighterId],
  );
  return r.rows;
}

export async function getByWeightClass(weightClassId: string): Promise<FighterRanking[]> {
  const r = await query<FighterRanking>(
    `select 
      fr.id,
      fr.fighter_id as "fighterId",
      fr.weight_class_id as "weightClassId",
      wc.name as "weightClassName",
      fr.ranking_position as "rankingPosition",
      fr.ranking_points as "rankingPoints",
      fr.ranking_date as "rankingDate"
     from fighter_rankings fr
     left join weight_classes wc on fr.weight_class_id = wc.id
     where fr.weight_class_id = $1
     order by fr.ranking_position nulls last, fr.ranking_points desc`,
    [weightClassId],
  );
  return r.rows;
}

export async function getById(id: string): Promise<FighterRanking | null> {
  const r = await query<FighterRanking>(
    `select 
      fr.id,
      fr.fighter_id as "fighterId",
      fr.weight_class_id as "weightClassId",
      wc.name as "weightClassName",
      fr.ranking_position as "rankingPosition",
      fr.ranking_points as "rankingPoints",
      fr.ranking_date as "rankingDate"
     from fighter_rankings fr
     left join weight_classes wc on fr.weight_class_id = wc.id
     where fr.id = $1`,
    [id],
  );
  return r.rows[0] ?? null;
}

export async function update(id: string, fields: UpdateRankingFields): Promise<FighterRanking | null> {
  const updates: string[] = [];
  const values: unknown[] = [];
  let paramCount = 1;

  if (fields.rankingPosition !== undefined) {
    updates.push(`ranking_position = $${paramCount++}`);
    values.push(fields.rankingPosition);
  }
  if (fields.rankingPoints !== undefined) {
    updates.push(`ranking_points = $${paramCount++}`);
    values.push(fields.rankingPoints);
  }
  if (fields.rankingDate !== undefined) {
    updates.push(`ranking_date = $${paramCount++}`);
    values.push(fields.rankingDate);
  }

  if (updates.length === 0) {
    return getById(id);
  }

  values.push(id);
  const r = await query<FighterRanking>(
    `update fighter_rankings
     set ${updates.join(', ')}
     where id = $${paramCount}
     returning id, fighter_id as "fighterId", weight_class_id as "weightClassId", ranking_position as "rankingPosition", ranking_points as "rankingPoints", ranking_date as "rankingDate"`,
    values,
  );
  const ranking = r.rows[0];
  if (!ranking) return null;
  const weightClassRes = await query<{ name: string }>(
    `select name from weight_classes where id = $1`,
    [ranking.weightClassId],
  );
  return { ...ranking, weightClassName: weightClassRes.rows[0]?.name ?? null };
}

export async function deleteById(id: string): Promise<void> {
  await query('delete from fighter_rankings where id = $1', [id]);
}

