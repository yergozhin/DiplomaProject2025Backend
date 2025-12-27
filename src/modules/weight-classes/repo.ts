import { query } from '@src/db/client';
import type { WeightClass, CreateWeightClassFields, UpdateWeightClassFields } from './model';

export async function create(fields: CreateWeightClassFields): Promise<WeightClass> {
  const r = await query<WeightClass>(
    `insert into weight_classes (name, min_weight_kg, max_weight_kg, description)
     values ($1, $2, $3, $4)
     returning id, name, min_weight_kg as "minWeightKg", max_weight_kg as "maxWeightKg", description, created_at as "createdAt"`,
    [fields.name, fields.minWeightKg ?? null, fields.maxWeightKg ?? null, fields.description ?? null],
  );
  return r.rows[0];
}

export async function all(): Promise<WeightClass[]> {
  const r = await query<WeightClass>(
    `select id, name, min_weight_kg as "minWeightKg", max_weight_kg as "maxWeightKg", description, created_at as "createdAt"
     from weight_classes
     order by min_weight_kg nulls last, name`,
  );
  return r.rows;
}

export async function getById(id: string): Promise<WeightClass | null> {
  const r = await query<WeightClass>(
    `select id, name, min_weight_kg as "minWeightKg", max_weight_kg as "maxWeightKg", description, created_at as "createdAt"
     from weight_classes
     where id = $1`,
    [id],
  );
  return r.rows[0] ?? null;
}

export async function getByName(name: string): Promise<WeightClass | null> {
  const r = await query<WeightClass>(
    `select id, name, min_weight_kg as "minWeightKg", max_weight_kg as "maxWeightKg", description, created_at as "createdAt"
     from weight_classes
     where name = $1`,
    [name],
  );
  return r.rows[0] ?? null;
}

export async function update(id: string, fields: UpdateWeightClassFields): Promise<WeightClass | null> {
  const updates: string[] = [];
  const values: unknown[] = [];
  let paramCount = 1;

  if (fields.name !== undefined) {
    updates.push(`name = $${paramCount++}`);
    values.push(fields.name);
  }
  if (fields.minWeightKg !== undefined) {
    updates.push(`min_weight_kg = $${paramCount++}`);
    values.push(fields.minWeightKg);
  }
  if (fields.maxWeightKg !== undefined) {
    updates.push(`max_weight_kg = $${paramCount++}`);
    values.push(fields.maxWeightKg);
  }
  if (fields.description !== undefined) {
    updates.push(`description = $${paramCount++}`);
    values.push(fields.description);
  }

  if (updates.length === 0) {
    return getById(id);
  }

  values.push(id);
  const r = await query<WeightClass>(
    `update weight_classes
     set ${updates.join(', ')}
     where id = $${paramCount}
     returning id, name, min_weight_kg as "minWeightKg", max_weight_kg as "maxWeightKg", description, created_at as "createdAt"`,
    values,
  );
  return r.rows[0] ?? null;
}

export async function deleteById(id: string): Promise<void> {
  await query('delete from weight_classes where id = $1', [id]);
}

