import { query } from '@src/db/client';
import { AuthUser } from './model';

export async function findUserByEmail(email: string): Promise<AuthUser | null> {
  const r = await query('select id, email, role from users where email=$1 limit 1', [email]);
  return r.rows[0] || null;
}

export async function createUser(email: string, passwordHash: string, role: 'fighter' | 'plo'): Promise<AuthUser> {
  const r = await query('insert into users (email, password_hash, role) values ($1,$2,$3) returning id, email, role', [email, passwordHash, role]);
  return r.rows[0];
}


