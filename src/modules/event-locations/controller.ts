import { Request, Response } from 'express';
import { AuthRequest } from '@src/middlewares/auth';
import * as s from './service';
import type { CreateLocationFields, UpdateLocationFields } from './model';

export async function create(req: AuthRequest, res: Response) {
  try {
    const fields: CreateLocationFields = {
      eventId: req.body.eventId,
      venueName: req.body.venueName,
      venueAddress: req.body.venueAddress,
      city: req.body.city,
      country: req.body.country,
      venueCapacity: req.body.venueCapacity,
    };
    const location = await s.create(fields);
    res.status(201).json(location);
  } catch (err) {
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
  } catch (err) {
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
  } catch (err) {
    res.status(500).json({ error: 'Failed to get event location' });
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id;
    const fields: UpdateLocationFields = {
      venueName: req.body.venueName,
      venueAddress: req.body.venueAddress,
      city: req.body.city,
      country: req.body.country,
      venueCapacity: req.body.venueCapacity,
    };
    const location = await s.update(id, fields);
    if (!location) {
      return res.status(404).json({ error: 'Event location not found' });
    }
    res.json(location);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update event location' });
  }
}

export async function deleteById(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id;
    await s.deleteById(id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete event location' });
  }
}

