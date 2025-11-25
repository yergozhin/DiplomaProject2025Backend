import { Request, Response } from 'express';
import { Roles, type Role } from '@src/common/constants/Roles';
import * as service from './service';

interface AuthRequestBody {
  email?: unknown;
  password?: unknown;
  role?: unknown;
}

function parseRole(value: unknown): Role | null {
  if (value === Roles.Fighter || value === Roles.PLO || value === Roles.Spectator) {
    return value;
  }
  return null;
}

function parseString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

export async function register(req: Request, res: Response) {
  const body = req.body as AuthRequestBody;
  const email = parseString(body.email);
  const password = parseString(body.password);
  const role = parseRole(body.role);
  if (!email || !password || !role) {
    return res.status(400).json({ error: 'invalid' });
  }
  try {
    const u = await service.register(email, password, role);
    if (!u) return res.status(409).json({ error: 'exists' });
    res.status(201).json(u);
  } catch {
    return res.status(500).json({ error: 'registration_failed' });
  }
}

export async function login(req: Request, res: Response) {
  const body = req.body as AuthRequestBody;
  const email = parseString(body.email);
  const password = parseString(body.password);
  const role = parseRole(body.role);
  if (!email || !password || !role) {
    return res.status(400).json({ error: 'invalid' });
  }
  const result = await service.login(email, password, role);
  if (!result) return res.status(401).json({ error: 'unauthorized' });
  if ('error' in result && result.error === 'email_not_verified') {
    return res.status(403).json({ error: 'email_not_verified' });
  }
  res.json(result);
}

export async function verifyEmail(req: Request, res: Response) {
  const token = parseString(req.query.token as unknown);
  if (!token) {
    return res.status(400).json({ error: 'invalid' });
  }
  const result = await service.verifyEmail(token);
  if (!result) {
    return res.status(404).json({ error: 'token_invalid_or_expired' });
  }
  res.json({ message: 'Email verified successfully', user: result });
}

export async function resendVerificationEmail(req: Request, res: Response) {
  const body = req.body as AuthRequestBody;
  const email = parseString(body.email);
  const role = parseRole(body.role);
  if (!email || !role) {
    return res.status(400).json({ error: 'invalid' });
  }
  try {
    const result = await service.resendVerificationEmail(email, role);
    if ('error' in result) {
      if (result.error === 'user_not_found') {
        return res.status(404).json({ error: 'user_not_found' });
      }
      if (result.error === 'already_verified') {
        return res.status(400).json({ error: 'already_verified' });
      }
    }
    res.json({ message: result.message });
  } catch {
    return res.status(500).json({ error: 'email_send_failed' });
  }
}

export async function requestPasswordReset(req: Request, res: Response) {
  const body = req.body as AuthRequestBody;
  const email = parseString(body.email);
  const role = parseRole(body.role);
  if (!email || !role) {
    return res.status(400).json({ error: 'invalid' });
  }
  try {
    const result = await service.requestPasswordReset(email, role);
    if ('error' in result) {
      if (result.error === 'user_not_found') {
        return res.status(404).json({ error: 'user_not_found' });
      }
    }
    res.json({ message: result.message });
  } catch {
    return res.status(500).json({ error: 'email_send_failed' });
  }
}

export async function resetPassword(req: Request, res: Response) {
  const body = req.body as { token?: unknown; password?: unknown; };
  const token = parseString(body.token);
  const password = parseString(body.password);
  if (!token || !password) {
    return res.status(400).json({ error: 'invalid' });
  }
  const result = await service.resetPassword(token, password);
  if (!result) {
    return res.status(404).json({ error: 'token_invalid_or_expired' });
  }
  res.json({ message: 'Password reset successfully' });
}



