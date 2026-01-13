import * as repo from './repo';
import crypto from 'crypto';
import { sign } from '@src/utils/jwt';
import { Roles, type Role } from '@src/common/constants/Roles';
import { generateVerificationToken, sendVerificationEmail, sendPasswordResetEmail } from '@src/utils/email';

function hashPassword(p: string) {
  return crypto.createHash('sha256').update(p).digest('hex');
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? '';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH ?? '';

function checkAdmin(email: string, password: string): boolean {
  if (!ADMIN_EMAIL || email !== ADMIN_EMAIL) return false;
  
  if (ADMIN_PASSWORD_HASH) {
    return hashPassword(password) === ADMIN_PASSWORD_HASH;
  }
  return password === ADMIN_PASSWORD;
}

function makeAdminLogin() {
  const token = sign({ userId: 'admin', role: Roles.Admin });
  return {
    user: {
      id: 'admin',
      email: ADMIN_EMAIL,
      role: Roles.Admin,
      ploStatus: null,
    },
    token,
  };
}

export async function register(email: string, password: string, role: Role) {
  if (!email || !password || !role) {
    return null;
  }
  if (password.length < 6) {
    return null;
  }
  
  if (checkAdmin(email, password)) return null;
  
  const existing = await repo.findUserByEmailAndRole(email, role);
  if (existing) return null;
  
  const hashed = hashPassword(password);
  const token = generateVerificationToken();
  const expires = new Date();
  expires.setTime(expires.getTime() + 24 * 60 * 60 * 1000);
  
  const newUser = await repo.createUser(email, hashed, role, token, expires);
  
  try {
    await sendVerificationEmail(email, token);
  } catch (err) {
    console.error('email send failed:', err);
  }
  
  return {
    id: newUser.id,
    email: newUser.email,
    role: newUser.role,
    ploStatus: newUser.plo_status ?? null,
  };
}

export const verifyEmail = async (token: string) => {
  if (!token) return null;
  const user = await repo.findUserByVerificationToken(token);
  if (!user) return null;
  await repo.verifyUserEmail(user.id);
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    ploStatus: user.plo_status ?? null,
  };
};

export async function login(email: string, password: string, role: Role) {
  if (checkAdmin(email, password)) {
    return makeAdminLogin();
  }
  
  const user = await repo.findUserByEmailAndRole(email, role);
  if (!user) return null;
  
  const hashed = hashPassword(password);
  if (user.password_hash !== hashed) return null;
  
  if (!user.email_verified) {
    return { error: 'email_not_verified' };
  }
  
  const ploStatus = user.role === Roles.PLO ? (user.plo_status ?? 'unverified') : null;
  const token = sign({ userId: user.id, role: user.role, ploStatus });
  
  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      ploStatus: user.plo_status ?? null,
    },
    token,
  };
}

export async function resendVerificationEmail(email: string, role: Role) {
  const user = await repo.findUserByEmailAndRole(email, role);
  if (!user) return { error: 'user_not_found' };
  if (user.email_verified) return { error: 'already_verified' };
  
  const token = generateVerificationToken();
  const expires = new Date();
  expires.setTime(expires.getTime() + 24 * 60 * 60 * 1000);
  
  await repo.updateVerificationToken(user.id, token, expires);
  
  try {
    await sendVerificationEmail(email, token);
  } catch (err) {
    console.error('email error:', err);
    return { error: 'email_send_failed' };
  }
  
  return { message: 'Verification email sent' };
}

export async function requestPasswordReset(email: string, role: Role) {
  const user = await repo.findUserByEmailAndRole(email, role);
  if (!user) return { error: 'user_not_found' };
  
  const token = generateVerificationToken();
  const expires = new Date();
  expires.setTime(expires.getTime() + 60 * 60 * 1000);
  
  await repo.updatePasswordResetToken(user.id, token, expires);
  
  try {
    await sendPasswordResetEmail(email, token);
  } catch (err) {
    console.error('reset email failed:', err);
    return { error: 'email_send_failed' };
  }
  
  return { message: 'Password reset email sent' };
}

export async function resetPassword(token: string, newPassword: string) {
  if (!token || !newPassword || newPassword.length < 6) {
    return null;
  }
  const user = await repo.findUserByPasswordResetToken(token);
  if (!user) return null;
  
  const hashed = hashPassword(newPassword);
  await repo.updatePassword(user.id, hashed);
  
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    ploStatus: user.plo_status ?? null,
  };
}


