import { Request, Response } from 'express';
import { AuthRequest } from '@src/middlewares/auth';
import * as s from './service';
import type { CreateResponseFields, UpdateResponseFields } from './model';

export async function create(req: AuthRequest, res: Response) {
  try {
    const fields: CreateResponseFields = {
      offerId: req.body.offerId,
      fighterId: req.body.fighterId,
      amount: req.body.amount,
      currency: req.body.currency,
      status: req.body.status,
    };
    const response = await s.create(fields);
    res.status(201).json(response);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create offer response' });
  }
}

export async function getByOffer(req: Request, res: Response) {
  try {
    const offerId = req.params.offerId;
    const responses = await s.getByOfferId(offerId);
    res.json(responses);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get offer responses' });
  }
}

export async function getByFighter(req: Request, res: Response) {
  try {
    const fighterId = req.params.fighterId;
    const responses = await s.getByFighterId(fighterId);
    res.json(responses);
  } catch (err) {
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
  } catch (err) {
    res.status(500).json({ error: 'Failed to get offer response' });
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id;
    const fields: UpdateResponseFields = {
      amount: req.body.amount,
      currency: req.body.currency,
      status: req.body.status,
    };
    const response = await s.update(id, fields);
    if (!response) {
      return res.status(404).json({ error: 'Offer response not found' });
    }
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update offer response' });
  }
}

export async function deleteById(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id;
    await s.deleteById(id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete offer response' });
  }
}

