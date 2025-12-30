import { query } from '@src/db/client';
import type { FighterRanking, CreateRankingFields, UpdateRankingFields } from './model';

export async function create(fields: CreateRankingFields): Promise<FighterRanking> {
  const r = await query<FighterRanking>(
    `with inserted as (
      insert into fighter_rankings (fighter_id, weight_class_id, ranking_position, ranking_points, ranking_date)
      values ((select id from fighter_profiles where user_id = $1), $2, $3, $4, $5)
      returning id, fighter_id, weight_class_id, ranking_position, ranking_points, ranking_date
    )
    select i.id, fp.user_id as "fighterId", i.weight_class_id as "weightClassId", i.ranking_position as "rankingPosition", i.ranking_points as "rankingPoints", i.ranking_date as "rankingDate"
    from inserted i
    join fighter_profiles fp on i.fighter_id = fp.id`,
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
    `with fighter_stats as (
      select 
        fp.id as fighter_profile_id,
        fp.user_id as fighter_user_id,
        coalesce(fp.first_name || ' ' || fp.last_name, fp.first_name, fp.last_name, u.name) as fighter_name,
        u.email as fighter_email,
        fpa.weight_class_id,
        wc.name as weight_class_name,
        coalesce(fr.wins, 0) as wins,
        coalesce(fr.losses, 0) as losses,
        coalesce(fr.draws, 0) as draws,
        coalesce(fr.total_fights, 0) as total_fights,
        case 
          when coalesce(fr.total_fights, 0) > 0 then 
            (coalesce(fr.wins, 0)::numeric / coalesce(fr.total_fights, 1)::numeric)
          else 0
        end as win_rate
      from fighter_profiles fp
      join users u on fp.user_id = u.id
      left join fighter_physical_attributes fpa on fp.id = fpa.fighter_id
      left join weight_classes wc on fpa.weight_class_id = wc.id
      left join fighter_records fr on fp.id = fr.fighter_id
      where u.role = 'fighter'
    ),
    ranked_fighters as (
      select 
        fighter_profile_id,
        fighter_user_id,
        fighter_name,
        fighter_email,
        weight_class_id,
        weight_class_name,
        wins,
        losses,
        draws,
        total_fights,
        win_rate,
        row_number() over (
          order by win_rate desc, wins desc, total_fights desc
        ) as ranking_position
      from fighter_stats
    )
    select 
      gen_random_uuid()::text as id,
      fighter_user_id as "fighterId",
      weight_class_id as "weightClassId",
      weight_class_name as "weightClassName",
      ranking_position as "rankingPosition",
      0 as "rankingPoints",
      current_date::text as "rankingDate",
      fighter_name as "fighterName",
      fighter_email as "fighterEmail",
      wins as "wins",
      losses as "losses",
      draws as "draws",
      total_fights as "totalFights"
    from ranked_fighters
    where fighter_user_id = $1
    order by ranking_position`,
    [fighterId],
  );
  return r.rows;
}

export async function getByWeightClass(weightClassId: string): Promise<FighterRanking[]> {
  const r = await query<FighterRanking>(
    `with fighter_stats as (
      select 
        fp.id as fighter_profile_id,
        fp.user_id as fighter_user_id,
        coalesce(fp.first_name || ' ' || fp.last_name, fp.first_name, fp.last_name, u.name) as fighter_name,
        u.email as fighter_email,
        fpa.weight_class_id,
        wc.name as weight_class_name,
        coalesce(fr.wins, 0) as wins,
        coalesce(fr.losses, 0) as losses,
        coalesce(fr.draws, 0) as draws,
        coalesce(fr.total_fights, 0) as total_fights,
        case 
          when coalesce(fr.total_fights, 0) > 0 then 
            (coalesce(fr.wins, 0)::numeric / coalesce(fr.total_fights, 1)::numeric)
          else 0
        end as win_rate
      from fighter_profiles fp
      join users u on fp.user_id = u.id
      left join fighter_physical_attributes fpa on fp.id = fpa.fighter_id
      left join weight_classes wc on fpa.weight_class_id = wc.id
      left join fighter_records fr on fp.id = fr.fighter_id
      where u.role = 'fighter' and fpa.weight_class_id = $1
    ),
    ranked_fighters as (
      select 
        fighter_profile_id,
        fighter_user_id,
        fighter_name,
        fighter_email,
        weight_class_id,
        weight_class_name,
        wins,
        losses,
        draws,
        total_fights,
        win_rate,
        row_number() over (
          order by win_rate desc, wins desc, total_fights desc
        ) as ranking_position
      from fighter_stats
    )
    select 
      gen_random_uuid()::text as id,
      fighter_user_id as "fighterId",
      weight_class_id as "weightClassId",
      weight_class_name as "weightClassName",
      ranking_position as "rankingPosition",
      0 as "rankingPoints",
      current_date::text as "rankingDate",
      fighter_name as "fighterName",
      fighter_email as "fighterEmail",
      wins as "wins",
      losses as "losses",
      draws as "draws",
      total_fights as "totalFights"
    from ranked_fighters
    order by ranking_position`,
    [weightClassId],
  );
  return r.rows;
}

export async function getById(id: string): Promise<FighterRanking | null> {
  const r = await query<FighterRanking>(
    `select 
      fr.id,
      fp.user_id as "fighterId",
      fr.weight_class_id as "weightClassId",
      wc.name as "weightClassName",
      fr.ranking_position as "rankingPosition",
      fr.ranking_points as "rankingPoints",
      fr.ranking_date as "rankingDate"
     from fighter_rankings fr
     join fighter_profiles fp on fr.fighter_id = fp.id
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
    `update fighter_rankings fr
     set ${updates.join(', ')}
     from fighter_profiles fp
     where fr.id = $${paramCount} and fr.fighter_id = fp.id
     returning fr.id, fp.user_id as "fighterId", fr.weight_class_id as "weightClassId", fr.ranking_position as "rankingPosition", fr.ranking_points as "rankingPoints", fr.ranking_date as "rankingDate"`,
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

export async function getAllLatest(): Promise<FighterRanking[]> {
  const r = await query<FighterRanking>(
    `with fighter_stats as (
      select 
        fp.id as fighter_profile_id,
        fp.user_id as fighter_user_id,
        coalesce(fp.first_name || ' ' || fp.last_name, fp.first_name, fp.last_name, u.name) as fighter_name,
        u.email as fighter_email,
        fpa.weight_class_id,
        wc.name as weight_class_name,
        coalesce(fr.wins, 0) as wins,
        coalesce(fr.losses, 0) as losses,
        coalesce(fr.draws, 0) as draws,
        coalesce(fr.total_fights, 0) as total_fights,
        case 
          when coalesce(fr.total_fights, 0) > 0 then 
            (coalesce(fr.wins, 0)::numeric / coalesce(fr.total_fights, 1)::numeric)
          else 0
        end as win_rate
      from fighter_profiles fp
      join users u on fp.user_id = u.id
      left join fighter_physical_attributes fpa on fp.id = fpa.fighter_id
      left join weight_classes wc on fpa.weight_class_id = wc.id
      left join fighter_records fr on fp.id = fr.fighter_id
      where u.role = 'fighter'
    ),
    ranked_fighters as (
      select 
        fighter_profile_id,
        fighter_user_id,
        fighter_name,
        fighter_email,
        weight_class_id,
        weight_class_name,
        wins,
        losses,
        draws,
        total_fights,
        win_rate,
        row_number() over (
          order by win_rate desc, wins desc, total_fights desc
        ) as ranking_position
      from fighter_stats
    )
    select 
      gen_random_uuid()::text as id,
      fighter_user_id as "fighterId",
      weight_class_id as "weightClassId",
      weight_class_name as "weightClassName",
      ranking_position as "rankingPosition",
      0 as "rankingPoints",
      current_date::text as "rankingDate",
      fighter_name as "fighterName",
      fighter_email as "fighterEmail",
      wins as "wins",
      losses as "losses",
      draws as "draws",
      total_fights as "totalFights"
    from ranked_fighters
    order by ranking_position`,
  );
  return r.rows;
}

export async function deleteById(id: string): Promise<void> {
  await query('delete from fighter_rankings where id = $1', [id]);
}

