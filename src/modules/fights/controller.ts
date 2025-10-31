import { Response } from 'express';
import { AuthRequest } from '@src/middlewares/auth';
import * as s from './service';

export async function getAll(_req: AuthRequest, res: Response) {
  const r = await s.list();
  res.json(r);
}

export async function sendRequest(req: AuthRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'unauthorized' });
  const { fighterId } = req.body;
  if (!fighterId) return res.status(400).json({ error: 'invalid' });
  const result = await s.sendRequest(req.user.userId, fighterId);
  if ('error' in result) {
    if (result.error === 'cannot_request_self') return res.status(400).json({ error: 'cannot_request_self' });
    if (result.error === 'sender_not_fighter' || result.error === 'receiver_not_fighter') return res.status(404).json({ error: 'fighter_not_found' });
    if (result.error === 'request_exists') return res.status(409).json({ error: 'request_exists' });
    return res.status(400).json({ error: result.error });
  }
  res.status(201).json(result);
}


