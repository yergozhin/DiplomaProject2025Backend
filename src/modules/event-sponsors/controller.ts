import { Request, Response } from 'express';
import { AuthRequest } from '@src/middlewares/auth';
import * as s from './service';
import type { CreateSponsorFields, UpdateSponsorFields } from './model';

export async function create(req: AuthRequest, res: Response) {
  try {
    const body = req.body as {
      eventId?: unknown;
      sponsorName?: unknown;
      sponsorLogo?: unknown;
      sponsorshipLevel?: unknown;
      sponsorshipAmount?: unknown;
    };
    const eventId = typeof body.eventId === 'string' ? body.eventId : null;
    const sponsorName = typeof body.sponsorName === 'string' ? body.sponsorName : null;
    const sponsorLogo = typeof body.sponsorLogo === 'string' ? body.sponsorLogo : null;
    const sponsorshipLevel = typeof body.sponsorshipLevel === 'string' && ['platinum', 'gold', 'silver', 'bronze'].includes(body.sponsorshipLevel) ? body.sponsorshipLevel as 'platinum' | 'gold' | 'silver' | 'bronze' : null;
    const sponsorshipAmount = typeof body.sponsorshipAmount === 'number' ? body.sponsorshipAmount : null;
    if (!eventId || !sponsorName) {
      return res.status(400).json({ error: 'invalid' });
    }
    const fields: CreateSponsorFields = {
      eventId,
      sponsorName,
      sponsorLogo,
      sponsorshipLevel,
      sponsorshipAmount,
    };
    const sponsor = await s.create(fields);
    res.status(201).json(sponsor);
  } catch {
    res.status(500).json({ error: 'Failed to create event sponsor' });
  }
}

export async function getByEvent(req: Request, res: Response) {
  try {
    const eventId = req.params.eventId;
    const sponsors = await s.getByEventId(eventId);
    res.json(sponsors);
  } catch {
    res.status(500).json({ error: 'Failed to get event sponsors' });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const sponsor = await s.getById(id);
    if (!sponsor) {
      return res.status(404).json({ error: 'Event sponsor not found' });
    }
    res.json(sponsor);
  } catch {
    res.status(500).json({ error: 'Failed to get event sponsor' });
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id;
    const body = req.body as {
      sponsorName?: unknown;
      sponsorLogo?: unknown;
      sponsorshipLevel?: unknown;
      sponsorshipAmount?: unknown;
    };
    const sponsorName = typeof body.sponsorName === 'string' ? body.sponsorName : undefined;
    const sponsorLogo = typeof body.sponsorLogo === 'string' ? body.sponsorLogo : null;
    const sponsorshipLevel = typeof body.sponsorshipLevel === 'string' && ['platinum', 'gold', 'silver', 'bronze'].includes(body.sponsorshipLevel) ? body.sponsorshipLevel as 'platinum' | 'gold' | 'silver' | 'bronze' : null;
    const sponsorshipAmount = typeof body.sponsorshipAmount === 'number' ? body.sponsorshipAmount : null;
    const fields: UpdateSponsorFields = {
      sponsorName,
      sponsorLogo,
      sponsorshipLevel,
      sponsorshipAmount,
    };
    const sponsor = await s.update(id, fields);
    if (!sponsor) {
      return res.status(404).json({ error: 'Event sponsor not found' });
    }
    res.json(sponsor);
  } catch {
    res.status(500).json({ error: 'Failed to update event sponsor' });
  }
}

export async function deleteById(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id;
    await s.deleteById(id);
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Failed to delete event sponsor' });
  }
}

