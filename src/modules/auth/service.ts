import * as repo from './repo';
import crypto from 'crypto';
import { sign } from '@src/utils/jwt';

function hashPassword(p: string) {
  return crypto.createHash('sha256').update(p).digest('hex');
}

export async function register(email: string, password: string, role: string) {
  const user = await repo.findUserByEmailAndRole(email, role);
  if (user) return null;
  const passwordHash = hashPassword(password);
  return repo.createUser(email, passwordHash, role);
}

export async function login(email: string, password: string, role: string) {
  const user = await repo.findUserByEmailAndRole(email, role);
  if (!user) return null;
  const passwordHash = hashPassword(password);
  if (user.password_hash !== passwordHash) return null;
  const token = sign({ userId: user.id, role: user.role });
  return { user: { id: user.id, email: user.email, role: user.role }, token };
}


