import { query } from '@src/db/client';
import type { EventCategory, CreateCategoryFields, UpdateCategoryFields, EventCategoryAssignment } from './model';

export const create = async (fields: CreateCategoryFields): Promise<EventCategory> => {
  const result = await query<EventCategory>(
    'insert into event_categories (name, description) values ($1, $2) returning id, name, description',
    [fields.name, fields.description ?? null],
  );
  return result.rows[0];
};

export async function all(): Promise<EventCategory[]> {
  const result = await query<EventCategory>(
    'select id, name, description from event_categories order by name',
  );
  return result.rows;
}

export async function getById(id: string): Promise<EventCategory | null> {
  const result = await query<EventCategory>(
    'select id, name, description from event_categories where id = $1',
    [id],
  );
  return result.rows[0] ?? null;
}

export async function update(id: string, fields: UpdateCategoryFields): Promise<EventCategory | null> {
  const updateFields: Record<string, unknown> = {};
  
  if (fields.name !== undefined) updateFields.name = fields.name;
  if (fields.description !== undefined) updateFields.description = fields.description;
  
  if (Object.keys(updateFields).length === 0) {
    return getById(id);
  }
  
  const setClauses: string[] = [];
  const keys = Object.keys(updateFields);
  for (const [i, key] of keys.entries()) {
    setClauses.push(`${key} = $${i + 1}`);
  }
  const values = Object.values(updateFields);
  values.push(id);
  
  const result = await query<EventCategory>(
    `update event_categories set ${setClauses.join(', ')} where id = $${values.length} returning id, name, description`,
    values,
  );
  
  return result.rows[0] ?? null;
}

export async function deleteById(id: string): Promise<void> {
  await query('delete from event_categories where id = $1', [id]);
}

export async function assignToEvent(eventId: string, categoryId: string): Promise<EventCategoryAssignment> {
  const res = await query<EventCategoryAssignment>(
    'insert into event_category_assignments (event_id, category_id) values ($1, $2) on conflict (event_id, category_id) do nothing returning id, event_id as "eventId", category_id as "categoryId"',
    [eventId, categoryId],
  );
  const assignment = res.rows[0];
  const catRes = await query<{ name: string }>(
    'select name from event_categories where id = $1',
    [categoryId],
  );
  return { ...assignment, categoryName: catRes.rows[0]?.name ?? null };
}

export async function removeFromEvent(eventId: string, categoryId: string): Promise<void> {
  await query('delete from event_category_assignments where event_id = $1 and category_id = $2', [eventId, categoryId]);
}

export async function getByEventId(eventId: string): Promise<EventCategoryAssignment[]> {
  const result = await query<EventCategoryAssignment>(
    'select eca.id, eca.event_id as "eventId", eca.category_id as "categoryId", ec.name as "categoryName" from event_category_assignments eca left join event_categories ec on eca.category_id = ec.id where eca.event_id = $1',
    [eventId],
  );
  return result.rows;
}

