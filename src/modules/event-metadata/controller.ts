import { Request, Response } from 'express';
import { AuthRequest } from '@src/middlewares/auth';
import * as s from './service';
import type { CreateMetadataFields, UpdateMetadataFields } from './model';

export async function create(req: AuthRequest, res: Response) {
  try {
    const fields: CreateMetadataFields = {
      eventId: req.body.eventId,
      posterImage: req.body.posterImage,
      ticketLink: req.body.ticketLink,
    };
    const metadata = await s.create(fields);
    res.status(201).json(metadata);
  } catch (err) {
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
  } catch (err) {
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
  } catch (err) {
    res.status(500).json({ error: 'Failed to get event metadata' });
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id;
    const fields: UpdateMetadataFields = {
      posterImage: req.body.posterImage,
      ticketLink: req.body.ticketLink,
    };
    const metadata = await s.update(id, fields);
    if (!metadata) {
      return res.status(404).json({ error: 'Event metadata not found' });
    }
    res.json(metadata);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update event metadata' });
  }
}

export async function deleteById(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id;
    await s.deleteById(id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete event metadata' });
  }
}

