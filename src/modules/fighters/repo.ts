import { query } from '@src/db/client';
import { Fighter } from './model';

export async function all(): Promise<Fighter[]> {
  const r = await query('select id, email, name, weight_class as "weightClass" from users where role=$1 order by name', ['fighter']);
  return r.rows as Fighter[];
}

export async function update(id: string, name: string, weightClass: string): Promise<Fighter | null> {
  const r = await query('update users set name=$2, weight_class=$3 where id=$1 and role=$4 returning id, email, name, weight_class as "weightClass"', [id, name, weightClass, 'fighter']);
  return r.rows[0] || null;
}

export async function getById(id: string): Promise<Fighter | null> {
  const r = await query('select id, email, name, weight_class as "weightClass" from users where id=$1 and role=$2', [id, 'fighter']);
  return r.rows[0] || null;
}

export async function allExcept(excludeId: string): Promise<Fighter[]> {
  const r = await query('select id, email, name, weight_class as "weightClass" from users where role=$1 and id != $2 order by name', ['fighter', excludeId]);
  return r.rows as Fighter[];
}


