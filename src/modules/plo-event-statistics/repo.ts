import { query } from '@src/db/client';
import type { PloEventStatistics, CreateStatisticsFields, UpdateStatisticsFields } from './model';

export async function create(fields: CreateStatisticsFields): Promise<PloEventStatistics> {
  const r = await query<PloEventStatistics>(
    `with inserted as (
      insert into plo_event_statistics (plo_id, total_events, completed_events, total_fights_organized, statistics_date)
      values ((select id from plo_profiles where user_id = $1), $2, $3, $4, $5)
      returning id, plo_id, total_events, completed_events, total_fights_organized, statistics_date
    )
    select i.id, pp.user_id as "ploId", i.total_events as "totalEvents", i.completed_events as "completedEvents", i.total_fights_organized as "totalFightsOrganized", i.statistics_date as "statisticsDate"
    from inserted i
    join plo_profiles pp on i.plo_id = pp.id`,
    [fields.ploId, fields.totalEvents ?? 0, fields.completedEvents ?? 0, fields.totalFightsOrganized ?? 0, fields.statisticsDate],
  );
  return r.rows[0];
}

export async function getByPloId(ploId: string): Promise<PloEventStatistics[]> {
  const r = await query<PloEventStatistics>(
    `with plo_profile as (
      select id, user_id from plo_profiles where user_id = $1
    ),
    current_stats as (
      select 
        pp.user_id as "ploId",
        coalesce(count(distinct e.id), 0)::integer as "totalEvents",
        coalesce(count(distinct case when e.status = 'completed' then e.id end), 0)::integer as "completedEvents",
        coalesce(count(distinct case when f.status = 'scheduled' and es.event_id = e.id then f.id end), 0)::integer as "totalFightsOrganized"
      from plo_profile pp
      left join events e on e.plo_profile_id = pp.id
      left join event_slots es on es.event_id = e.id
      left join fights f on f.id = es.fight_id
      group by pp.user_id
    )
    select 
      gen_random_uuid()::text as id,
      cs."ploId",
      cs."totalEvents",
      cs."completedEvents",
      cs."totalFightsOrganized",
      current_date::text as "statisticsDate"
    from current_stats cs
    union all
    select pes.id::text, pp.user_id as "ploId", pes.total_events as "totalEvents", pes.completed_events as "completedEvents", pes.total_fights_organized as "totalFightsOrganized", pes.statistics_date::text as "statisticsDate"
    from plo_event_statistics pes
    join plo_profiles pp on pes.plo_id = pp.id
    where pp.user_id = $1
    order by "statisticsDate" desc`,
    [ploId],
  );
  return r.rows;
}

export async function getById(id: string): Promise<PloEventStatistics | null> {
  const r = await query<PloEventStatistics>(
    `select pes.id, pp.user_id as "ploId", pes.total_events as "totalEvents", pes.completed_events as "completedEvents", pes.total_fights_organized as "totalFightsOrganized", pes.statistics_date as "statisticsDate"
     from plo_event_statistics pes
     join plo_profiles pp on pes.plo_id = pp.id
     where pes.id = $1`,
    [id],
  );
  return r.rows[0] ?? null;
}

export async function update(id: string, fields: UpdateStatisticsFields): Promise<PloEventStatistics | null> {
  const updates: string[] = [];
  const values: unknown[] = [];
  let paramCount = 1;

  if (fields.totalEvents !== undefined) {
    updates.push(`total_events = $${paramCount++}`);
    values.push(fields.totalEvents);
  }
  if (fields.completedEvents !== undefined) {
    updates.push(`completed_events = $${paramCount++}`);
    values.push(fields.completedEvents);
  }
  if (fields.totalFightsOrganized !== undefined) {
    updates.push(`total_fights_organized = $${paramCount++}`);
    values.push(fields.totalFightsOrganized);
  }
  if (fields.statisticsDate !== undefined) {
    updates.push(`statistics_date = $${paramCount++}`);
    values.push(fields.statisticsDate);
  }

  if (updates.length === 0) {
    return getById(id);
  }

  values.push(id);
  const r = await query<PloEventStatistics>(
    `update plo_event_statistics pes
     set ${updates.join(', ')}
     from plo_profiles pp
     where pes.id = $${paramCount} and pes.plo_id = pp.id
     returning pes.id, pp.user_id as "ploId", pes.total_events as "totalEvents", pes.completed_events as "completedEvents", pes.total_fights_organized as "totalFightsOrganized", pes.statistics_date as "statisticsDate"`,
    values,
  );
  return r.rows[0] ?? null;
}

export async function deleteById(id: string): Promise<void> {
  await query('delete from plo_event_statistics where id = $1', [id]);
}

