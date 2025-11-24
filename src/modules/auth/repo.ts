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
        plo_status,
        email_verified
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
  verificationToken: string,
  tokenExpiresAt: Date,
): Promise<AuthUser> {
  const r = await query<AuthUser>(
    `
      insert into users (email, password_hash, role, email_verification_token, email_verification_token_expires_at)
      values ($1, $2, $3, $4, $5)
      returning id, email, role, plo_status
    `,
    [email, passwordHash, role, verificationToken, tokenExpiresAt],
  );
  return r.rows[0];
}

export async function findUserByVerificationToken(
  token: string,
): Promise<AuthUser | null> {
  const r = await query<AuthUser>(
    `
      select
        id,
        email,
        role,
        password_hash,
        plo_status,
        email_verified
      from users
      where email_verification_token = $1
        and email_verification_token_expires_at > now()
        and email_verified = false
      limit 1
    `,
    [token],
  );
  return r.rows[0] || null;
}

export async function verifyUserEmail(userId: string): Promise<void> {
  await query(
    `
      update users
      set email_verified = true,
          email_verification_token = null,
          email_verification_token_expires_at = null
      where id = $1
    `,
    [userId],
  );
}

export async function updateVerificationToken(
  userId: string,
  token: string,
  expiresAt: Date,
): Promise<void> {
  await query(
    `
      update users
      set email_verification_token = $2,
          email_verification_token_expires_at = $3
      where id = $1
    `,
    [userId, token, expiresAt],
  );
}


