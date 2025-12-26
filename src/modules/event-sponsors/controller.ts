import { Request, Response } from 'express';
import { AuthRequest } from '@src/middlewares/auth';
import * as s from './service';
import type { CreateSponsorFields, UpdateSponsorFields } from './model';

export async function create(req: AuthRequest, res: Response) {
  try {
    const fields: CreateSponsorFields = {
      eventId: req.body.eventId,
      sponsorName: req.body.sponsorName,
      sponsorLogo: req.body.sponsorLogo,
      sponsorshipLevel: req.body.sponsorshipLevel,
      sponsorshipAmount: req.body.sponsorshipAmount,
    };
    const sponsor = await s.create(fields);
    res.status(201).json(sponsor);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create event sponsor' });
  }
}

export async function getByEvent(req: Request, res: Response) {
  try {
    const eventId = req.params.eventId;
    const sponsors = await s.getByEventId(eventId);
    res.json(sponsors);
  } catch (err) {
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
  } catch (err) {
    res.status(500).json({ error: 'Failed to get event sponsor' });
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id;
    const fields: UpdateSponsorFields = {
      sponsorName: req.body.sponsorName,
      sponsorLogo: req.body.sponsorLogo,
      sponsorshipLevel: req.body.sponsorshipLevel,
      sponsorshipAmount: req.body.sponsorshipAmount,
    };
    const sponsor = await s.update(id, fields);
    if (!sponsor) {
      return res.status(404).json({ error: 'Event sponsor not found' });
    }
    res.json(sponsor);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update event sponsor' });
  }
}

export async function deleteById(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id;
    await s.deleteById(id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete event sponsor' });
  }
}

