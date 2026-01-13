import { Request, Response } from 'express';
import { AuthRequest } from '@src/middlewares/auth';
import * as s from './service';
import type { CreateResponseFields, UpdateResponseFields } from './model';

export async function create(req: AuthRequest, res: Response) {
  const body = req.body;
  
  if (!body.offerId || !body.fighterId || typeof body.amount !== 'number') {
    return res.status(400).json({ error: 'invalid' });
  }
  
  const validStatuses = ['pending', 'accepted', 'rejected'];
  const status = validStatuses.includes(body.status) ? body.status : undefined;
  
  const fields: CreateResponseFields = {
    offerId: body.offerId,
    fighterId: body.fighterId,
    amount: body.amount,
    currency: body.currency,
    status,
  };
  
  const response = await s.create(fields);
  res.status(201).json(response);
}

export async function getByOffer(req: Request, res: Response) {
  const offerId = req.params.offerId;
  const responses = await s.getByOfferId(offerId);
  res.json(responses);
}

export async function getByFighter(req: Request, res: Response) {
  const fighterId = req.params.fighterId;
  const responses = await s.getByFighterId(fighterId);
  res.json(responses);
}

export async function getById(req: Request, res: Response) {
  const id = req.params.id;
  const response = await s.getById(id);
  if (!response) {
    return res.status(404).json({ error: 'Offer response not found' });
  }
  res.json(response);
}

export async function update(req: AuthRequest, res: Response) {
  const id = req.params.id;
  const body = req.body;
  
  const validStatuses = ['pending', 'accepted', 'rejected'];
  const amount = typeof body.amount === 'number' ? body.amount : undefined;
  const currency = typeof body.currency === 'string' ? body.currency : undefined;
  const status = typeof body.status === 'string' && validStatuses.includes(body.status) 
    ? body.status as 'pending' | 'accepted' | 'rejected' 
    : undefined;
  
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
}

export async function deleteById(req: AuthRequest, res: Response) {
  const id = req.params.id;
  await s.remove(id);
  res.status(204).send();
}
