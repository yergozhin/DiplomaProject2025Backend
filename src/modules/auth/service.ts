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

function isAdminCredentials(email: string, password: string): boolean {
  if (!ADMIN_EMAIL) return false;
  if (email !== ADMIN_EMAIL) return false;
  if (ADMIN_PASSWORD_HASH) {
    return hashPassword(password) === ADMIN_PASSWORD_HASH;
  }
  if (ADMIN_PASSWORD) {
    return password === ADMIN_PASSWORD;
  }
  return false;
}

function buildAdminResponse() {
  const adminId = 'admin';
  const token = sign({ userId: adminId, role: Roles.Admin });
  return {
    user: {
      id: adminId,
      email: ADMIN_EMAIL,
      role: Roles.Admin,
      ploStatus: null,
    },
    token,
  };
}

export async function register(email: string, password: string, role: Role) {
  if (isAdminCredentials(email, password)) return null;
  const user = await repo.findUserByEmailAndRole(email, role);
  if (user) return null;
  const passwordHash = hashPassword(password);
  const verificationToken = generateVerificationToken();
  const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const created = await repo.createUser(email, passwordHash, role, verificationToken, tokenExpiresAt);
  
  try {
    await sendVerificationEmail(email, verificationToken);
  } catch (emailError) {
    console.error('Failed to send verification email:', emailError);
  }
  
  return {
    id: created.id,
    email: created.email,
    role: created.role,
    ploStatus: created.plo_status ?? null,
  };
}

export async function verifyEmail(token: string) {
  const user = await repo.findUserByVerificationToken(token);
  if (!user) return null;
  await repo.verifyUserEmail(user.id);
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    ploStatus: user.plo_status ?? null,
  };
}

export async function login(email: string, password: string, role: Role) {
  if (isAdminCredentials(email, password)) {
    return buildAdminResponse();
  }
  const user = await repo.findUserByEmailAndRole(email, role);
  if (!user) return null;
  const passwordHash = hashPassword(password);
  if (user.password_hash !== passwordHash) return null;
  if (!user.email_verified) {
    return { error: 'email_not_verified' };
  }
  const tokenPayload = {
    userId: user.id,
    role: user.role,
    ploStatus: user.role === Roles.PLO ? user.plo_status ?? 'unverified' : null,
  };
  const token = sign(tokenPayload);
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
  
  const verificationToken = generateVerificationToken();
  const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  
  await repo.updateVerificationToken(user.id, verificationToken, tokenExpiresAt);
  try {
    await sendVerificationEmail(email, verificationToken);
  } catch (emailError) {
    console.error('Failed to send verification email:', emailError);
    throw emailError;
  }
  
  return { message: 'Verification email sent' };
}

export async function requestPasswordReset(email: string, role: Role) {
  const user = await repo.findUserByEmailAndRole(email, role);
  if (!user) return { error: 'user_not_found' };
  
  const resetToken = generateVerificationToken();
  const tokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
  
  await repo.updatePasswordResetToken(user.id, resetToken, tokenExpiresAt);
  try {
    await sendPasswordResetEmail(email, resetToken);
  } catch (emailError) {
    console.error('Failed to send password reset email:', emailError);
    throw emailError;
  }
  
  return { message: 'Password reset email sent' };
}

export async function resetPassword(token: string, newPassword: string) {
  const user = await repo.findUserByPasswordResetToken(token);
  if (!user) return null;
  
  const passwordHash = hashPassword(newPassword);
  await repo.updatePassword(user.id, passwordHash);
  
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    ploStatus: user.plo_status ?? null,
  };
}


