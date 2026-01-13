import { Response } from 'express';
import { AuthRequest } from '@src/middlewares/auth';
import { Roles } from '@src/common/constants/Roles';
import * as s from './service';

interface EventCreateBody {
  name?: unknown;
  slots?: unknown;
}

interface EventUpdateBody {
  eventName?: unknown;
  eventDescription?: unknown;
  venueName?: unknown;
  venueAddress?: unknown;
  city?: unknown;
  country?: unknown;
  venueCapacity?: unknown;
  posterImage?: unknown;
  ticketLink?: unknown;
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

function parseOptionalString(value: unknown) {
  if (value == null) return null;
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseOptionalInt(value: unknown) {
  if (value == null || value === '') return null;
  if (typeof value !== 'number') return null;
  if (!Number.isFinite(value)) return null;
  
  const int = Math.round(value);
  return int >= 0 ? int : null;
}

export function getAll(_req: AuthRequest, res: Response) {
  s.list().then(r => {
    res.json(r);
  });
}

export function getPublished(_req: AuthRequest, res: Response) {
  s.listPublished().then(events => {
    res.json(events);
  });
}

export async function create(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'unauthorized' });
    if (req.user.role === Roles.PLO && req.user.ploStatus !== 'verified') {
      return res.status(403).json({ error: 'plo_not_verified' });
    }
    const body = req.body as EventCreateBody;
    const name = parseName(body.name);
    const slots = parseSlots(body.slots);
    if (name == null || slots == null) {
      return res.status(400).json({ error: 'invalid' });
    }
    const event = await s.createEvent(req.user.userId, name, slots);
    res.status(201).json(event);
  } catch (err: unknown) {
    const message = err && typeof err === 'object' && 'message' in err && typeof err.message === 'string' ? err.message : 'invalid';
    res.status(400).json({ error: message });
  }
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

export async function updateEvent(req: AuthRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'unauthorized' });
  if (req.user.role === Roles.PLO && req.user.ploStatus !== 'verified') {
    return res.status(403).json({ error: 'plo_not_verified' });
  }
  
  const { eventId } = req.params;
  if (typeof eventId !== 'string' || eventId.trim().length === 0) {
    return res.status(400).json({ error: 'invalid' });
  }

  const body = req.body as EventUpdateBody;
  const venueCapacity = parseOptionalInt(body.venueCapacity);
  if (body.venueCapacity !== undefined && venueCapacity === null) {
    return res.status(400).json({ error: 'invalid_capacity' });
  }

  const payload = {
    eventName: parseOptionalString(body.eventName),
    eventDescription: parseOptionalString(body.eventDescription),
    venueName: parseOptionalString(body.venueName),
    venueAddress: parseOptionalString(body.venueAddress),
    city: parseOptionalString(body.city),
    country: parseOptionalString(body.country),
    venueCapacity,
    posterImage: parseOptionalString(body.posterImage),
    ticketLink: parseOptionalString(body.ticketLink),
  };

  const updated = await s.updateEvent(eventId, req.user.userId, payload);
  if (!updated) return res.status(404).json({ error: 'not_found' });
  
  res.json(updated);
}

interface EventStatusBody {
  status?: unknown;
}

export async function publishEvent(req: AuthRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'unauthorized' });
  if (req.user.role === Roles.PLO && req.user.ploStatus !== 'verified') {
    return res.status(403).json({ error: 'plo_not_verified' });
  }
  const { eventId } = req.params;
  if (typeof eventId !== 'string' || eventId.trim().length === 0) {
    return res.status(400).json({ error: 'invalid' });
  }
  const body = (req.body ?? {}) as EventStatusBody;
  if (body.status !== undefined && body.status !== 'published') {
    return res.status(400).json({ error: 'invalid_status' });
  }

  const result = await s.publishEvent(eventId, req.user.userId);
  if (!result.event) {
    if (result.error === 'not_found') return res.status(404).json({ error: 'not_found' });
    if (result.error === 'invalid_status') return res.status(400).json({ error: 'invalid_status_transition' });
    if (result.error === 'missing_required_fields') return res.status(400).json({ error: 'missing_required_fields' });
    if (result.error === 'no_slots') return res.status(400).json({ error: 'no_slots' });
    return res.status(400).json({ error: 'invalid' });
  }

  res.json(result.event);
}

export async function getFightsForEvent(req: AuthRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'unauthorized' });
  const { eventId } = req.params;
  if (typeof eventId !== 'string' || eventId.trim().length === 0) {
    return res.status(400).json({ error: 'invalid' });
  }
  const fights = await s.getFightsForEvent(eventId);
  res.json(fights);
}

