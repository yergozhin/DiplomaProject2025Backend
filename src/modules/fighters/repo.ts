import { query } from '@src/db/client';
import { Fighter } from './model';

export async function all(): Promise<Fighter[]> {
  const r = await query('select id, name, weight_class as "weightClass" from fighters order by name');
  return r.rows as Fighter[];
}

export async function create(name: string, weightClass: string): Promise<Fighter> {
  const r = await query('insert into fighters (name, weight_class) values ($1,$2) returning id, name, weight_class as "weightClass"', [name, weightClass]);
  return r.rows[0];
}

export async function update(id: string, name: string, weightClass: string): Promise<Fighter | null> {
  const r = await query('update fighters set name=$2, weight_class=$3 where id=$1 returning id, name, weight_class as "weightClass"', [id, name, weightClass]);
  return r.rows[0] || null;
}

export async function remove(id: string): Promise<void> {
  await query('delete from fighters where id=$1', [id]);
}


