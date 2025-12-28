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
    `select pes.id, pp.user_id as "ploId", pes.total_events as "totalEvents", pes.completed_events as "completedEvents", pes.total_fights_organized as "totalFightsOrganized", pes.statistics_date as "statisticsDate"
     from plo_event_statistics pes
     join plo_profiles pp on pes.plo_id = pp.id
     where pp.user_id = $1
     order by pes.statistics_date desc`,
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

