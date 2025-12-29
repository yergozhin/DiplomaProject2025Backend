import { Response } from 'express';
import { AuthRequest } from '@src/middlewares/auth';
import * as s from './service';

interface FightRequestBody {
  fighterId?: unknown;
}

function parseId(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

export async function getAll(_req: AuthRequest, res: Response) {
  const r = await s.list();
  res.json(r);
}

export async function sendRequest(req: AuthRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'unauthorized' });
  const body = req.body as FightRequestBody;
  const fighterId = parseId(body.fighterId);
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

export async function getRequestsTo(req: AuthRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'unauthorized' });
  const r = await s.getRequestsTo(req.user.userId);
  res.json(r);
}

export async function acceptFight(req: AuthRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'unauthorized' });
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'invalid' });
  const result = await s.acceptFight(id, req.user.userId);
  if ('error' in result) {
    if (result.error === 'fight_not_found') return res.status(404).json({ error: 'fight_not_found' });
    if (result.error === 'invalid_status') return res.status(400).json({ error: 'invalid_status' });
    if (result.error === 'not_receiver') return res.status(403).json({ error: 'forbidden' });
    return res.status(400).json({ error: result.error });
  }
  res.json(result);
}

export async function getAccepted(_req: AuthRequest, res: Response) {
  const r = await s.getAccepted();
  res.json(r);
}

export async function getAcceptedForFighter(req: AuthRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'unauthorized' });
  const r = await s.getAcceptedForFighter(req.user.userId);
  res.json(r);
}

export async function getScheduled(req: AuthRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'unauthorized' });
  const r = await s.getScheduledForFighter(req.user.userId);
  res.json(r);
}

export async function getAvailableFightsForPlo(req: AuthRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'unauthorized' });
  const r = await s.getAvailableFightsForPlo(req.user.userId);
  res.json(r);
}

export async function getById(req: AuthRequest, res: Response) {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'invalid' });
  const fight = await s.getByIdWithFighters(id);
  if (!fight) return res.status(404).json({ error: 'fight_not_found' });
  res.json(fight);
}


