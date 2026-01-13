import { query } from '@src/db/client';
import type { FightHistory, CreateHistoryFields } from './model';

export function create(fields: CreateHistoryFields): Promise<FightHistory> {
  return query<FightHistory & { changed_by_name: string | null }>(
    'insert into fight_history (fight_id, status, changed_by, change_reason) values ($1, $2, $3, $4) returning id, fight_id as "fightId", status, changed_by as "changedBy", change_reason as "changeReason", changed_at as "changedAt"',
    [fields.fightId, fields.status, fields.changedBy ?? null, fields.changeReason ?? null],
  ).then(async (result) => {
    const history = result.rows[0];
    let changedByName = null;
    if (history.changedBy) {
      const userRes = await query<{ email: string }>(
        'select email from users where id = $1',
        [history.changedBy],
      );
      changedByName = userRes.rows[0]?.email ?? null;
    }
    return { ...history, changedByName };
  });
}

export async function getByFightId(fightId: string): Promise<FightHistory[]> {
  const res = await query<FightHistory & { changed_by_name: string | null }>(
    'select id, fight_id as "fightId", status, changed_by as "changedBy", change_reason as "changeReason", changed_at as "changedAt" from fight_history where fight_id = $1 order by changed_at desc',
    [fightId],
  );
  const histories = await Promise.all(res.rows.map(async (history) => {
    let changedByName = null;
    if (history.changedBy) {
      const userRes = await query<{ email: string }>(
        'select email from users where id = $1',
        [history.changedBy],
      );
      changedByName = userRes.rows[0]?.email ?? null;
    }
    return { ...history, changedByName };
  }));
  return histories;
}

export const getById = async (id: string): Promise<FightHistory | null> => {
  const result = await query<FightHistory & { changed_by_name: string | null }>(
    'select id, fight_id as "fightId", status, changed_by as "changedBy", change_reason as "changeReason", changed_at as "changedAt" from fight_history where id = $1',
    [id],
  );
  const history = result.rows[0];
  if (!history) return null;
  let changedByName = null;
  if (history.changedBy) {
    const userRes = await query<{ email: string }>(
      'select email from users where id = $1',
      [history.changedBy],
    );
    changedByName = userRes.rows[0]?.email || null;
  }
  return { ...history, changedByName };
};

