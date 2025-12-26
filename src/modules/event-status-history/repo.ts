import { query } from '@src/db/client';
import type { EventStatusHistory, CreateStatusHistoryFields } from './model';

export async function create(fields: CreateStatusHistoryFields): Promise<EventStatusHistory> {
  const r = await query<EventStatusHistory & { changed_by_name: string | null }>(
    `insert into event_status_history (event_id, status, changed_by, change_reason)
     values ($1, $2, $3, $4)
     returning id, event_id as "eventId", status, changed_by as "changedBy", change_reason as "changeReason", changed_at as "changedAt"`,
    [fields.eventId, fields.status, fields.changedBy ?? null, fields.changeReason ?? null],
  );
  const history = r.rows[0];
  let changedByName = null;
  if (history.changedBy) {
    const userRes = await query<{ email: string }>(
      `select email from users where id = $1`,
      [history.changedBy],
    );
    changedByName = userRes.rows[0]?.email || null;
  }
  return { ...history, changedByName };
}

export async function getByEventId(eventId: string): Promise<EventStatusHistory[]> {
  const r = await query<EventStatusHistory & { changed_by_name: string | null }>(
    `select id, event_id as "eventId", status, changed_by as "changedBy", change_reason as "changeReason", changed_at as "changedAt"
     from event_status_history
     where event_id = $1
     order by changed_at desc`,
    [eventId],
  );
  const histories = await Promise.all(r.rows.map(async (history) => {
    let changedByName = null;
    if (history.changedBy) {
      const userRes = await query<{ email: string }>(
        `select email from users where id = $1`,
        [history.changedBy],
      );
      changedByName = userRes.rows[0]?.email || null;
    }
    return { ...history, changedByName };
  }));
  return histories;
}

export async function getById(id: string): Promise<EventStatusHistory | null> {
  const r = await query<EventStatusHistory & { changed_by_name: string | null }>(
    `select id, event_id as "eventId", status, changed_by as "changedBy", change_reason as "changeReason", changed_at as "changedAt"
     from event_status_history
     where id = $1`,
    [id],
  );
  const history = r.rows[0];
  if (!history) return null;
  let changedByName = null;
  if (history.changedBy) {
    const userRes = await query<{ email: string }>(
      `select email from users where id = $1`,
      [history.changedBy],
    );
    changedByName = userRes.rows[0]?.email || null;
  }
  return { ...history, changedByName };
}

