import { Request, Response } from 'express';
import { AuthRequest } from '@src/middlewares/auth';
import * as s from './service';
import type { CreateSponsorFields, UpdateSponsorFields } from './model';

export async function create(req: AuthRequest, res: Response) {
  try {
    const body = req.body as {
      eventId?: unknown,
      sponsorName?: unknown,
      sponsorLogo?: unknown,
      sponsorshipLevel?: unknown,
      sponsorshipAmount?: unknown,
    };
    if (typeof body.eventId !== 'string' || !body.eventId) {
      return res.status(400).json({ error: 'invalid' });
    }
    if (typeof body.sponsorName !== 'string' || !body.sponsorName) {
      return res.status(400).json({ error: 'invalid' });
    }
  
    const validLevels = ['platinum', 'gold', 'silver', 'bronze'];
    const sponsorshipLevel = typeof body.sponsorshipLevel === 'string' && validLevels.includes(body.sponsorshipLevel)
      ? body.sponsorshipLevel as 'platinum' | 'gold' | 'silver' | 'bronze'
      : null;
  
    const fields: CreateSponsorFields = {
      eventId: body.eventId,
      sponsorName: body.sponsorName,
      sponsorLogo: typeof body.sponsorLogo === 'string' ? body.sponsorLogo : null,
      sponsorshipLevel,
      sponsorshipAmount: typeof body.sponsorshipAmount === 'number' ? body.sponsorshipAmount : null,
    };
  
    const sponsor = await s.create(fields);
    res.status(201).json(sponsor);
  } catch (err: unknown) {
    const message = err && typeof err === 'object' && 'message' in err && typeof err.message === 'string' ? err.message : 'invalid';
    res.status(400).json({ error: message });
  }
}

export async function getByEvent(req: Request, res: Response) {
  const eventId = req.params.eventId;
  const sponsors = await s.getByEventId(eventId);
  res.json(sponsors);
}

export async function getById(req: Request, res: Response) {
  const id = req.params.id;
  const sponsor = await s.getById(id);
  if (!sponsor) {
    return res.status(404).json({ error: 'Event sponsor not found' });
  }
  res.json(sponsor);
}

export async function update(req: AuthRequest, res: Response) {
  const id = req.params.id;
  const body = req.body as {
    sponsorName?: unknown;
    sponsorLogo?: unknown;
    sponsorshipLevel?: unknown;
    sponsorshipAmount?: unknown;
  };
  
  const validLevels = ['platinum', 'gold', 'silver', 'bronze'];
  const sponsorName = typeof body.sponsorName === 'string' ? body.sponsorName : undefined;
  const sponsorLogo = typeof body.sponsorLogo === 'string' ? body.sponsorLogo : null;
  const sponsorshipLevel = typeof body.sponsorshipLevel === 'string' && validLevels.includes(body.sponsorshipLevel) 
    ? body.sponsorshipLevel as 'platinum' | 'gold' | 'silver' | 'bronze' 
    : null;
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
}

export async function deleteById(req: AuthRequest, res: Response) {
  const id = req.params.id;
  await s.remove(id);
  res.status(204).send();
}

