import { query } from '@src/db/client';
import type { Role } from '@src/common/constants/Roles';
import type { AuthUser } from './model';

export async function findUserByEmailAndRole(
  email: string,
  role: Role,
): Promise<AuthUser | null> {
  const r = await query<AuthUser>(
    `
      select
        id,
        email,
        role,
        password_hash,
        plo_status
      from users
      where email = $1 and role = $2
      limit 1
    `,
    [email, role],
  );
  return r.rows[0] || null;
}

export async function createUser(
  email: string,
  passwordHash: string,
  role: Role,
): Promise<AuthUser> {
  const r = await query<AuthUser>(
    `
      insert into users (email, password_hash, role)
      values ($1, $2, $3)
      returning id, email, role, plo_status
    `,
    [email, passwordHash, role],
  );
  return r.rows[0];
}


