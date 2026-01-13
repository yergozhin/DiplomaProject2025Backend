import { query } from '@src/db/client';
import type { WeightClass, CreateWeightClassFields, UpdateWeightClassFields } from './model';

export async function create(fields: CreateWeightClassFields): Promise<WeightClass> {
  const r = await query<WeightClass>(
    `insert into weight_classes (name, min_weight_kg, max_weight_kg, description)
     values ($1, $2, $3, $4)
     returning id, name, min_weight_kg as "minWeightKg", max_weight_kg as "maxWeightKg", description, created_at as "createdAt"`,
    [fields.name, fields.minWeightKg || null, fields.maxWeightKg || null, fields.description || null],
  );
  return r.rows[0];
}

export const all = async (): Promise<WeightClass[]> => {
  const r = await query<WeightClass>(
    `select id, name, min_weight_kg as "minWeightKg", max_weight_kg as "maxWeightKg", description, created_at as "createdAt"
     from weight_classes
     order by min_weight_kg nulls last, name`,
  );
  return r.rows;
};

export async function getById(id: string): Promise<WeightClass | null> {
  const r = await query<WeightClass>(
    `select id, name, min_weight_kg as "minWeightKg", max_weight_kg as "maxWeightKg", description, created_at as "createdAt"
     from weight_classes
     where id = $1`,
    [id],
  );
  return r.rows[0] || null;
}

export async function getByName(name: string): Promise<WeightClass | null> {
  const r = await query<WeightClass>(
    `select id, name, min_weight_kg as "minWeightKg", max_weight_kg as "maxWeightKg", description, created_at as "createdAt"
     from weight_classes
     where name = $1`,
    [name],
  );
  return r.rows[0] || null;
}

export async function update(id: string, fields: UpdateWeightClassFields): Promise<WeightClass | null> {
  const toUpdate: Array<{ field: string; val: unknown }> = [];
  
  if (fields.name !== undefined) toUpdate.push({ field: 'name', val: fields.name });
  if (fields.minWeightKg !== undefined) toUpdate.push({ field: 'min_weight_kg', val: fields.minWeightKg });
  if (fields.maxWeightKg !== undefined) toUpdate.push({ field: 'max_weight_kg', val: fields.maxWeightKg });
  if (fields.description !== undefined) toUpdate.push({ field: 'description', val: fields.description });
  
  if (toUpdate.length === 0) {
    return getById(id);
  }
  
  const setParts: string[] = [];
  for (let i = 0; i < toUpdate.length; i++) {
    setParts.push(`${toUpdate[i].field} = $${i + 1}`);
  }
  const paramValues: unknown[] = [];
  for (let i = 0; i < toUpdate.length; i++) {
    paramValues.push(toUpdate[i].val);
  }
  paramValues.push(id);
  
  const r = await query<WeightClass>(
    `update weight_classes set ${setParts.join(', ')} where id = $${paramValues.length} returning id, name, min_weight_kg as "minWeightKg", max_weight_kg as "maxWeightKg", description, created_at as "createdAt"`,
    paramValues,
  );
  
  return r.rows[0] || null;
}

export async function deleteById(id: string): Promise<void> {
  await query('delete from weight_classes where id = $1', [id]);
}

