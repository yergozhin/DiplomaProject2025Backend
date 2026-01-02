import { Request, Response } from 'express';
import { AuthRequest } from '@src/middlewares/auth';
import * as s from './service';
import type { CreateMetadataFields, UpdateMetadataFields } from './model';

export async function create(req: AuthRequest, res: Response) {
  try {
    const body = req.body as {
      eventId?: unknown,
      posterImage?: unknown,
      ticketLink?: unknown,
    };
    const eventId = typeof body.eventId === 'string' ? body.eventId : null;
    const posterImage = typeof body.posterImage === 'string' ? body.posterImage : null;
    const ticketLink = typeof body.ticketLink === 'string' ? body.ticketLink : null;
    if (!eventId) {
      return res.status(400).json({ error: 'invalid' });
    }
    const fields: CreateMetadataFields = {
      eventId,
      posterImage,
      ticketLink,
    };
    const metadata = await s.create(fields);
    res.status(201).json(metadata);
  } catch {
    res.status(500).json({ error: 'Failed to create event metadata' });
  }
}

export async function getByEvent(req: Request, res: Response) {
  try {
    const eventId = req.params.eventId;
    const metadata = await s.getByEventId(eventId);
    if (!metadata) {
      return res.status(404).json({ error: 'Event metadata not found' });
    }
    res.json(metadata);
  } catch {
    res.status(500).json({ error: 'Failed to get event metadata' });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const metadata = await s.getById(id);
    if (!metadata) {
      return res.status(404).json({ error: 'Event metadata not found' });
    }
    res.json(metadata);
  } catch {
    res.status(500).json({ error: 'Failed to get event metadata' });
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id;
    const body = req.body as {
      posterImage?: unknown,
      ticketLink?: unknown,
    };
    const posterImage = typeof body.posterImage === 'string' ? body.posterImage : null;
    const ticketLink = typeof body.ticketLink === 'string' ? body.ticketLink : null;
    const fields: UpdateMetadataFields = {
      posterImage,
      ticketLink,
    };
    const metadata = await s.update(id, fields);
    if (!metadata) {
      return res.status(404).json({ error: 'Event metadata not found' });
    }
    res.json(metadata);
  } catch {
    res.status(500).json({ error: 'Failed to update event metadata' });
  }
}

export async function deleteById(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id;
    await s.deleteById(id);
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Failed to delete event metadata' });
  }
}
