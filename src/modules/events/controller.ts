import { Response } from 'express';
import { AuthRequest } from '@src/middlewares/auth';
import * as s from './service';

interface EventCreateBody {
  name?: unknown;
  slots?: unknown;
}

function parseName(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

function parseSlots(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  const slots: string[] = [];
  for (const item of value) {
    if (typeof item !== 'string' || item.trim().length === 0) {
      return null;
    }
    slots.push(item);
  }
  return slots.length > 0 ? slots : null;
}

export async function getAll(_req: AuthRequest, res: Response) {
  const r = await s.list();
  res.json(r);
}

export async function create(req: AuthRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'unauthorized' });
  const body = req.body as EventCreateBody;
  const name = parseName(body.name);
  const slots = parseSlots(body.slots);
  if (!name || !slots) {
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


