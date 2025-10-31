import * as repo from './repo';
import crypto from 'crypto';

function hashPassword(p: string) {
  return crypto.createHash('sha256').update(p).digest('hex');
}

export async function register(email: string, password: string, role: 'fighter' | 'plo') {
  const user = await repo.findUserByEmail(email);
  if (user) return null;
  const passwordHash = hashPassword(password);
  return repo.createUser(email, passwordHash, role);
}

export async function login(email: string, password: string) {
  const user = await repo.findUserByEmail(email);
  if (!user) return null;
  return user;
}


