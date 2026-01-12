import { Response } from 'express';
import { AuthRequest } from '@src/middlewares/auth';
import * as s from './service';

interface UpdatePloStatusBody {
  status?: unknown;
}

function parseStatus(value: unknown): 'unverified' | 'verified' | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim().toLowerCase();
  if (trimmed === 'unverified' || trimmed === 'verified') return trimmed;
  return null;
}

export async function listPlos(req: AuthRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'unauthorized' });
  const plos = await s.getPlos();
  res.json(plos);
}

export async function updatePloStatus(req: AuthRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'unauthorized' });
  
  const { ploId } = req.params;
  if (typeof ploId !== 'string' || ploId.trim().length === 0) {
    return res.status(400).json({ error: 'invalid' });
  }
  
  const body = req.body as UpdatePloStatusBody;
  const status = parseStatus(body.status);
  if (!status) return res.status(400).json({ error: 'invalid' });
  
  const result = await s.setPloStatus(ploId, status);
  if (!result) return res.status(404).json({ error: 'not_found' });
  
  res.json(result);
}

export async function listUsers(req: AuthRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'unauthorized' });
  const users = await s.getUsers();
  res.json(users);
}

export async function verifyUserEmail(req: AuthRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'unauthorized' });
  const { userId } = req.params;
  if (typeof userId !== 'string' || userId.trim().length === 0) {
    return res.status(400).json({ error: 'invalid' });
  }
  const result = await s.verifyEmail(userId);
  if (!result) return res.status(404).json({ error: 'not_found' });
  res.json(result);
}

export async function listMedicalClearances(req: AuthRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'unauthorized' });
  const clearances = await s.getMedicalClearances();
  res.json(clearances);
}


