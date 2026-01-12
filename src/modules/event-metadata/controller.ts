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
    if (typeof body.eventId !== 'string' || body.eventId.trim().length === 0) {
      return res.status(400).json({ error: 'invalid' });
    }
    
    const fields: CreateMetadataFields = {
      eventId: body.eventId,
      posterImage: typeof body.posterImage === 'string' ? body.posterImage : null,
      ticketLink: typeof body.ticketLink === 'string' ? body.ticketLink : null,
    };
    
    const metadata = await s.create(fields);
    res.status(201).json(metadata);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'invalid' });
  }
}

export function getByEvent(req: Request, res: Response) {
  const eventId = req.params.eventId;
  s.getByEventId(eventId).then(metadata => {
    if (!metadata) {
      res.status(404).json({ error: 'not found' });
    } else {
      res.json(metadata);
    }
  });
}

export async function getById(req: Request, res: Response) {
  const id = req.params.id;
  const metadata = await s.getById(id);
  if (!metadata) {
    return res.status(404).json({ error: 'Event metadata not found' });
  }
  res.json(metadata);
}

export async function update(req: AuthRequest, res: Response) {
  const id = req.params.id;
  const body = req.body as any;
  
  const fields: UpdateMetadataFields = {};
  if (body.posterImage !== undefined) {
    fields.posterImage = typeof body.posterImage === 'string' ? body.posterImage : null;
  }
  if (body.ticketLink !== undefined) {
    fields.ticketLink = typeof body.ticketLink === 'string' ? body.ticketLink : null;
  }
  
  const metadata = await s.update(id, fields);
  if (!metadata) {
    return res.status(404).json({ error: 'Event metadata not found' });
  }
  
  res.json(metadata);
}

export async function deleteById(req: AuthRequest, res: Response) {
  const id = req.params.id;
  await s.deleteMetadata(id);
  res.status(204).send();
}
