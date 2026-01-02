import { Request, Response } from 'express';
import { AuthRequest } from '@src/middlewares/auth';
import * as s from './service';
import type { CreateResponseFields, UpdateResponseFields } from './model';

export async function create(req: AuthRequest, res: Response) {
  try {
    const body = req.body as {
      offerId?: unknown,
      fighterId?: unknown,
      amount?: unknown,
      currency?: unknown,
      status?: unknown,
    };
    const offerId = typeof body.offerId === 'string' ? body.offerId : null;
    const fighterId = typeof body.fighterId === 'string' ? body.fighterId : null;
    const amount = typeof body.amount === 'number' ? body.amount : null;
    const currency = typeof body.currency === 'string' ? body.currency : undefined;
    const status = typeof body.status === 'string' && ['pending', 'accepted', 'rejected'].includes(body.status) ? body.status as 'pending' | 'accepted' | 'rejected' : undefined;
    if (!offerId || !fighterId || amount === null) {
      return res.status(400).json({ error: 'invalid' });
    }
    const fields: CreateResponseFields = {
      offerId,
      fighterId,
      amount,
      currency,
      status,
    };
    const response = await s.create(fields);
    res.status(201).json(response);
  } catch {
    res.status(500).json({ error: 'Failed to create offer response' });
  }
}

export async function getByOffer(req: Request, res: Response) {
  try {
    const offerId = req.params.offerId;
    const responses = await s.getByOfferId(offerId);
    res.json(responses);
  } catch {
    res.status(500).json({ error: 'Failed to get offer responses' });
  }
}

export async function getByFighter(req: Request, res: Response) {
  try {
    const fighterId = req.params.fighterId;
    const responses = await s.getByFighterId(fighterId);
    res.json(responses);
  } catch {
    res.status(500).json({ error: 'Failed to get offer responses' });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const response = await s.getById(id);
    if (!response) {
      return res.status(404).json({ error: 'Offer response not found' });
    }
    res.json(response);
  } catch {
    res.status(500).json({ error: 'Failed to get offer response' });
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id;
    const body = req.body as {
      amount?: unknown,
      currency?: unknown,
      status?: unknown,
    };
    const amount = typeof body.amount === 'number' ? body.amount : undefined;
    const currency = typeof body.currency === 'string' ? body.currency : undefined;
    const status = typeof body.status === 'string' && ['pending', 'accepted', 'rejected'].includes(body.status) ? body.status as 'pending' | 'accepted' | 'rejected' : undefined;
    const fields: UpdateResponseFields = {
      amount,
      currency,
      status,
    };
    const response = await s.update(id, fields);
    if (!response) {
      return res.status(404).json({ error: 'Offer response not found' });
    }
    res.json(response);
  } catch {
    res.status(500).json({ error: 'Failed to update offer response' });
  }
}

export async function deleteById(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id;
    await s.deleteById(id);
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Failed to delete offer response' });
  }
}
