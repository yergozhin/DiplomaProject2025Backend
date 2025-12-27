import pool, { query } from '@src/db/client';
import type { Role } from '@src/common/constants/Roles';
import type { AuthUser } from './model';

export async function findUserByEmailAndRole(
  email: string,
  role: Role,
): Promise<AuthUser | null> {
  if (role === 'plo') {
    const r = await query<AuthUser>(
      `
        select
          u.id,
          u.email,
          u.role,
          u.password_hash,
          pp.plo_status,
          u.email_verified
        from users u
        left join plo_profiles pp on u.id = pp.user_id
        where u.email = $1 and u.role = $2
        limit 1
      `,
      [email, role],
    );
    return r.rows[0] || null;
  }
  const r = await query<AuthUser>(
    `
      select
        id,
        email,
        role,
        password_hash,
        null as plo_status,
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
  const client = await pool.connect();
  try {
    await client.query('begin');
    const userRes = await client.query<AuthUser>(
      `
        insert into users (email, password_hash, role, email_verification_token, email_verification_token_expires_at)
        values ($1, $2, $3, $4, $5)
        returning id, email, role
      `,
      [email, passwordHash, role, verificationToken, tokenExpiresAt],
    );
    const user = userRes.rows[0];
    
    if (role === 'fighter') {
      await client.query(
        `insert into fighter_profiles (user_id) values ($1) on conflict (user_id) do nothing`,
        [user.id],
      );
      await client.query(
        `insert into fighter_physical_attributes (fighter_id) 
         select id from fighter_profiles where user_id = $1 
         on conflict (fighter_id) do nothing`,
        [user.id],
      );
      await client.query(
        `insert into fighter_contact_info (fighter_id) 
         select id from fighter_profiles where user_id = $1 
         on conflict (fighter_id) do nothing`,
        [user.id],
      );
      await client.query(
        `insert into fighter_records (fighter_id) 
         select id from fighter_profiles where user_id = $1 
         on conflict (fighter_id) do nothing`,
        [user.id],
      );
    } else if (role === 'plo') {
      await client.query(
        `insert into plo_profiles (user_id, league_name) 
         values ($1, 'Unnamed League') 
         on conflict (user_id) do nothing`,
        [user.id],
      );
      await client.query(
        `insert into plo_contact_info (plo_id) 
         select id from plo_profiles where user_id = $1 
         on conflict (plo_id) do nothing`,
        [user.id],
      );
    }
    
    await client.query('commit');
    
    if (role === 'plo') {
      const ploRes = await client.query<{ plo_status: 'unverified' | 'verified' }>(
        `select plo_status from plo_profiles where user_id = $1`,
        [user.id],
      );
      const ploStatus = ploRes.rows[0]?.plo_status as 'unverified' | 'verified' | null;
      return { id: user.id, email: user.email, role: user.role, plo_status: ploStatus || null };
    }
    
    return { id: user.id, email: user.email, role: user.role, plo_status: null };
  } catch (err) {
    await client.query('rollback');
    throw err;
  } finally {
    client.release();
  }
}

export async function findUserByVerificationToken(
  token: string,
): Promise<AuthUser | null> {
  const r = await query<AuthUser>(
    `
      select
        u.id,
        u.email,
        u.role,
        u.password_hash,
        pp.plo_status,
        u.email_verified
      from users u
      left join plo_profiles pp on u.id = pp.user_id
      where u.email_verification_token = $1
        and u.email_verification_token_expires_at > now()
        and u.email_verified = false
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

export async function findUserByPasswordResetToken(
  token: string,
): Promise<AuthUser | null> {
  const r = await query<AuthUser>(
    `
      select
        u.id,
        u.email,
        u.role,
        u.password_hash,
        pp.plo_status,
        u.email_verified
      from users u
      left join plo_profiles pp on u.id = pp.user_id
      where u.password_reset_token = $1
        and u.password_reset_token_expires_at > now()
      limit 1
    `,
    [token],
  );
  return r.rows[0] || null;
}

export async function updatePasswordResetToken(
  userId: string,
  token: string,
  expiresAt: Date,
): Promise<void> {
  await query(
    `
      update users
      set password_reset_token = $2,
          password_reset_token_expires_at = $3
      where id = $1
    `,
    [userId, token, expiresAt],
  );
}

export async function updatePassword(
  userId: string,
  passwordHash: string,
): Promise<void> {
  await query(
    `
      update users
      set password_hash = $2,
          password_reset_token = null,
          password_reset_token_expires_at = null
      where id = $1
    `,
    [userId, passwordHash],
  );
}


