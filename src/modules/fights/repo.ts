import { query } from '@src/db/client';
import { Fight } from './model';

export async function all(): Promise<Fight[]> {
  const r = await query('select id, fighter_a_id as "fighterAId", fighter_b_id as "fighterBId", status from fights order by id desc');
  return r.rows as Fight[];
}

export async function create(fighterAId: string, fighterBId: string): Promise<Fight> {
  const r = await query('insert into fights (fighter_a_id, fighter_b_id, status) values ($1, $2, $3) returning id, fighter_a_id as "fighterAId", fighter_b_id as "fighterBId", status', [fighterAId, fighterBId, 'requested']);
  return r.rows[0];
}

export async function findExisting(fighterAId: string, fighterBId: string): Promise<Fight | null> {
  const r = await query('select id, fighter_a_id as "fighterAId", fighter_b_id as "fighterBId", status from fights where ((fighter_a_id=$1 and fighter_b_id=$2) or (fighter_a_id=$2 and fighter_b_id=$1)) and status != $3 limit 1', [fighterAId, fighterBId, 'deleted']);
  return r.rows[0] || null;
}

export async function getFighterById(id: string): Promise<{ id: string } | null> {
  const r = await query('select id from users where id=$1 and role=$2', [id, 'fighter']);
  return r.rows[0] || null;
}

export async function getRequestsTo(fighterId: string): Promise<any[]> {
  const r = await query(`
    select 
      f.id,
      f.status,
      f.fighter_a_id as "fighterAId",
      f.fighter_b_id as "fighterBId",
      u.id as "senderId",
      u.email as "senderEmail",
      u.name as "senderName",
      u.weight_class as "senderWeightClass"
    from fights f
    join users u on f.fighter_a_id = u.id
    where f.fighter_b_id = $1 and f.status = $2
    order by f.id desc
  `, [fighterId, 'requested']);
  return r.rows;
}


