import { Request, Response } from 'express';
import { AuthRequest } from '@src/middlewares/auth';
import * as repo from './repo';
import type { CreateLocationFields, UpdateLocationFields } from './model';

export async function create(req: AuthRequest, res: Response) {
  const body = req.body as {
    eventId?: unknown;
    venueName?: unknown;
    venueAddress?: unknown;
    city?: unknown;
    country?: unknown;
    venueCapacity?: unknown;
  };
  
  if (typeof body.eventId !== 'string' || !body.eventId || typeof body.venueName !== 'string' || !body.venueName) {
    return res.status(400).json({ error: 'invalid' });
  }
  
  const fields: CreateLocationFields = {
    eventId: body.eventId,
    venueName: body.venueName,
    venueAddress: typeof body.venueAddress === 'string' ? body.venueAddress : null,
    city: typeof body.city === 'string' ? body.city : null,
    country: typeof body.country === 'string' ? body.country : null,
    venueCapacity: typeof body.venueCapacity === 'number' ? body.venueCapacity : null,
  };
  
  try {
    const location = await repo.create(fields);
    res.status(201).json(location);
  } catch (err: unknown) {
    const message = err && typeof err === 'object' && 'message' in err && typeof err.message === 'string' ? err.message : 'invalid';
    res.status(400).json({ error: message });
  }
}

export async function getByEvent(req: Request, res: Response) {
  const eventId = req.params.eventId;
  const location = await repo.getByEventId(eventId);
  
  if (!location) {
    return res.status(404).json({ error: 'Event location not found' });
  }
  
  res.json(location);
}

export async function getById(req: Request, res: Response) {
  const id = req.params.id;
  const location = await repo.getById(id);
  
  if (!location) {
    return res.status(404).json({ error: 'Event location not found' });
  }
  
  res.json(location);
}

export async function update(req: AuthRequest, res: Response) {
  const id = req.params.id;
  const body = req.body as {
    venueName?: unknown;
    venueAddress?: unknown;
    city?: unknown;
    country?: unknown;
    venueCapacity?: unknown;
  };
  
  const venueName = typeof body.venueName === 'string' ? body.venueName : null;
  const venueAddress = typeof body.venueAddress === 'string' ? body.venueAddress : null;
  const city = typeof body.city === 'string' ? body.city : null;
  const country = typeof body.country === 'string' ? body.country : null;
  const venueCapacity = typeof body.venueCapacity === 'number' ? body.venueCapacity : null;
  
  if (!venueName) {
    return res.status(400).json({ error: 'invalid' });
  }
  
  const fields: UpdateLocationFields = {
    venueName,
    venueAddress,
    city,
    country,
    venueCapacity,
  };
  
  const location = await repo.update(id, fields);
  if (!location) {
    return res.status(404).json({ error: 'Event location not found' });
  }
  
  res.json(location);
}

export async function deleteById(req: AuthRequest, res: Response) {
  const id = req.params.id;
  await repo.deleteById(id);
  res.status(204).send();
}

