import * as repo from './repo';
import crypto from 'crypto';
import { sign } from '@src/utils/jwt';
import { Roles, type Role } from '@src/common/constants/Roles';

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
  const created = await repo.createUser(email, passwordHash, role);
  return {
    id: created.id,
    email: created.email,
    role: created.role,
    ploStatus: created.plo_status ?? null,
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


