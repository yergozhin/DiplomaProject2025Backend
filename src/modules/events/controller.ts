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

export async function getMyEvents(req: AuthRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'unauthorized' });
  const r = await s.getByPloId(req.user.userId);
  res.json(r);
}

export async function getAvailableSlots(req: AuthRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'unauthorized' });
  const { eventId } = req.params;
  if (!eventId) return res.status(400).json({ error: 'invalid' });
  const result = await s.getAvailableSlotsForEvent(eventId, req.user.userId);
  if ('error' in result) {
    if (result.error === 'event_not_found') return res.status(404).json({ error: 'event_not_found' });
    if (result.error === 'event_not_owned') return res.status(403).json({ error: 'forbidden' });
    return res.status(400).json({ error: result.error });
  }
  res.json(result);
}


