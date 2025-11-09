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
  const u = await service.register(email, password, role);
  if (!u) return res.status(409).json({ error: 'exists' });
  res.status(201).json(u);
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
  res.json(result);
}


