import { Response } from 'express';
import { AuthRequest } from '@src/middlewares/auth';
import * as s from './service';

export async function getAll(_req: AuthRequest, res: Response) {
  const r = await s.list();
  res.json(r);
}

export async function create(req: AuthRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'unauthorized' });
  const { name, slots } = req.body;
  if (!name || !slots || !Array.isArray(slots) || slots.length === 0) {
    return res.status(400).json({ error: 'invalid' });
  }
  const event = await s.createEvent(req.user.userId, name, slots);
  res.status(201).json(event);
}


