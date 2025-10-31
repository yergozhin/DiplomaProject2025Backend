import { Request, Response } from 'express';
import { AuthRequest } from '@src/middlewares/auth';
import * as s from './service';

export async function getAll(_req: Request, res: Response) {
  const r = await s.list();
  res.json(r);
}

export async function getProfile(req: AuthRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'unauthorized' });
  const r = await s.getById(req.user.userId);
  if (!r) return res.status(404).json({ error: 'not_found' });
  res.json(r);
}

export async function updateProfile(req: AuthRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'unauthorized' });
  const { name, weightClass } = req.body;
  if (!name || !weightClass) return res.status(400).json({ error: 'invalid' });
  const r = await s.edit(req.user.userId, name, weightClass);
  if (!r) return res.status(404).json({ error: 'not_found' });
  res.json(r);
}

export async function getList(req: AuthRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'unauthorized' });
  const r = await s.listExcept(req.user.userId);
  res.json(r);
}


