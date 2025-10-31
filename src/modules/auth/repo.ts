import { query } from '@src/db/client';
import { AuthUser } from './model';

export async function findUserByEmailAndRole(email: string, role: string): Promise<AuthUser | null> {
  const r = await query('select id, email, role, password_hash from users where email=$1 and role=$2 limit 1', [email, role]);
  return r.rows[0] || null;
}

export async function createUser(email: string, passwordHash: string, role: string): Promise<AuthUser> {
  const r = await query('insert into users (email, password_hash, role) values ($1,$2,$3) returning id, email, role', [email, passwordHash, role]);
  return r.rows[0];
}


