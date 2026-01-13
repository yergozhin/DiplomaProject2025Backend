import { Request, Response } from 'express';
import { AuthRequest } from '@src/middlewares/auth';
import * as repo from './repo';
import type { CreateInjuryFields, UpdateInjuryFields } from './model';

export async function create(req: AuthRequest, res: Response) {
  const body = req.body as any;
  
  if (!body.fighterId || !body.injuryType) {
    return res.status(400).json({ error: 'invalid' });
  }
  
  const validStatuses = ['recovering', 'cleared', 'ongoing'];
  const recoveryStatus = validStatuses.includes(body.recoveryStatus) ? body.recoveryStatus : null;
  
  const fields: CreateInjuryFields = {
    fighterId: body.fighterId,
    injuryType: body.injuryType,
    injuryDescription: body.injuryDescription || null,
    injuryDate: body.injuryDate || null,
    recoveryStatus,
    medicalNotes: body.medicalNotes || null,
  };
  
  if (!fields.fighterId || !fields.injuryType) {
    return res.status(400).json({ error: 'invalid' });
  }
  
  const injury = await repo.create(fields);
  
  res.status(201).json(injury);
}

export async function getByFighter(req: Request, res: Response) {
  const fighterId = req.params.fighterId;
  const injuries = await repo.getByFighterId(fighterId);
  
  res.json(injuries);
}

export async function getById(req: Request, res: Response) {
  const id = req.params.id;
  const injury = await repo.getById(id);
  
  if (!injury) {
    return res.status(404).json({ error: 'Injury not found' });
  }
  
  res.json(injury);
}

export async function update(req: AuthRequest, res: Response) {
  const id = req.params.id;
  const body = req.body as any;
  
  const validStatuses = ['recovering', 'cleared', 'ongoing'];
  const fields: UpdateInjuryFields = {};
  
  if (typeof body.injuryType === 'string') {
    fields.injuryType = body.injuryType;
  }
  if (body.injuryDescription !== undefined) {
    fields.injuryDescription = typeof body.injuryDescription === 'string' ? body.injuryDescription : null;
  }
  if (body.injuryDate !== undefined) {
    fields.injuryDate = typeof body.injuryDate === 'string' ? body.injuryDate : null;
  }
  if (body.recoveryStatus !== undefined) {
    fields.recoveryStatus = typeof body.recoveryStatus === 'string' && validStatuses.includes(body.recoveryStatus)
      ? body.recoveryStatus as 'recovering' | 'cleared' | 'ongoing'
      : null;
  }
  if (body.medicalNotes !== undefined) {
    fields.medicalNotes = typeof body.medicalNotes === 'string' ? body.medicalNotes : null;
  }
  
  const injury = await repo.update(id, fields);
  if (!injury) {
    return res.status(404).json({ error: 'Injury not found' });
  }
  
  res.json(injury);
}

export async function deleteById(req: AuthRequest, res: Response) {
  const id = req.params.id;
  await repo.deleteById(id);
  res.status(204).send();
}
