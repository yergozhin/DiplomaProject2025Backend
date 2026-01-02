import { Request, Response } from 'express';
import { AuthRequest } from '@src/middlewares/auth';
import * as s from './service';
import type { CreateLocationFields, UpdateLocationFields } from './model';

export async function create(req: AuthRequest, res: Response) {
  try {
    const body = req.body as {
      eventId?: unknown,
      venueName?: unknown,
      venueAddress?: unknown,
      city?: unknown,
      country?: unknown,
      venueCapacity?: unknown,
    };
    const eventId = typeof body.eventId === 'string' ? body.eventId : null;
    const venueName = typeof body.venueName === 'string' ? body.venueName : null;
    const venueAddress = typeof body.venueAddress === 'string' ? body.venueAddress : null;
    const city = typeof body.city === 'string' ? body.city : null;
    const country = typeof body.country === 'string' ? body.country : null;
    const venueCapacity = typeof body.venueCapacity === 'number' ? body.venueCapacity : null;
    if (!eventId || !venueName) {
      return res.status(400).json({ error: 'invalid' });
    }
    const fields: CreateLocationFields = {
      eventId,
      venueName,
      venueAddress,
      city,
      country,
      venueCapacity,
    };
    const location = await s.create(fields);
    res.status(201).json(location);
  } catch {
    res.status(500).json({ error: 'Failed to create event location' });
  }
}

export async function getByEvent(req: Request, res: Response) {
  try {
    const eventId = req.params.eventId;
    const location = await s.getByEventId(eventId);
    if (!location) {
      return res.status(404).json({ error: 'Event location not found' });
    }
    res.json(location);
  } catch {
    res.status(500).json({ error: 'Failed to get event location' });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const location = await s.getById(id);
    if (!location) {
      return res.status(404).json({ error: 'Event location not found' });
    }
    res.json(location);
  } catch {
    res.status(500).json({ error: 'Failed to get event location' });
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id;
    const body = req.body as {
      venueName?: unknown,
      venueAddress?: unknown,
      city?: unknown,
      country?: unknown,
      venueCapacity?: unknown,
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
    const location = await s.update(id, fields);
    if (!location) {
      return res.status(404).json({ error: 'Event location not found' });
    }
    res.json(location);
  } catch {
    res.status(500).json({ error: 'Failed to update event location' });
  }
}

export async function deleteById(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id;
    await s.deleteById(id);
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Failed to delete event location' });
  }
}

