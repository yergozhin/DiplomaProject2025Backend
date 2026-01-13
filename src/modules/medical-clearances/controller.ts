import { Request, Response } from 'express';
import { AuthRequest } from '@src/middlewares/auth';
import * as s from './service';
import type { CreateClearanceFields, UpdateClearanceFields } from './model';

export async function create(req: AuthRequest, res: Response) {
  try {
    const body = req.body as {
      fighterId?: unknown,
      clearanceDate?: unknown,
      expirationDate?: unknown,
      clearedBy?: unknown,
      clearanceType?: unknown,
      notes?: unknown,
      status?: unknown,
    };
    
    if (typeof body.fighterId !== 'string' || !body.fighterId || typeof body.clearanceDate !== 'string' || !body.clearanceDate) {
      return res.status(400).json({ error: 'invalid' });
    }
    
    const clearanceTypes = ['pre-fight', 'post-fight', 'annual', 'emergency'];
    const statuses = ['pending', 'approved', 'rejected'];
    
    const fields: CreateClearanceFields = {
      fighterId: body.fighterId,
      clearanceDate: body.clearanceDate,
      expirationDate: typeof body.expirationDate === 'string' && body.expirationDate.trim() !== '' ? body.expirationDate : null,
      clearedBy: typeof body.clearedBy === 'string' && body.clearedBy.trim() !== '' ? body.clearedBy : null,
      clearanceType: typeof body.clearanceType === 'string' && clearanceTypes.includes(body.clearanceType) ? body.clearanceType as 'pre-fight' | 'post-fight' | 'annual' | 'emergency' : null,
      notes: typeof body.notes === 'string' && body.notes.trim() !== '' ? body.notes : null,
      status: typeof body.status === 'string' && statuses.includes(body.status) ? body.status as 'pending' | 'approved' | 'rejected' : 'pending',
    };
    
    const clearance = await s.create(fields);
    res.status(201).json(clearance);
  } catch (err: unknown) {
    const message = err && typeof err === 'object' && 'message' in err && typeof err.message === 'string' ? err.message : 'invalid';
    res.status(400).json({ error: message });
  }
}

export function getByFighter(req: Request, res: Response) {
  const fighterId = req.params.fighterId;
  s.getByFighterId(fighterId).then(clearances => {
    res.json(clearances);
  });
}

export async function getById(req: Request, res: Response) {
  const id = req.params.id;
  const clearance = await s.getById(id);
  if (!clearance) {
    return res.status(404).json({ error: 'Medical clearance not found' });
  }
  res.json(clearance);
}

export async function update(req: AuthRequest, res: Response) {
  const id = req.params.id;
  const body = req.body as {
    clearanceDate?: unknown;
    expirationDate?: unknown;
    clearedBy?: unknown;
    clearanceType?: unknown;
    notes?: unknown;
    status?: unknown;
  };
  
  const fields: UpdateClearanceFields = {};
  const clearanceTypes = ['pre-fight', 'post-fight', 'annual', 'emergency'];
  const statuses = ['pending', 'approved', 'rejected'];
  
  if (body.clearanceDate !== undefined) {
    fields.clearanceDate = typeof body.clearanceDate === 'string' ? body.clearanceDate : undefined;
  }
  if (body.expirationDate !== undefined) {
    fields.expirationDate = typeof body.expirationDate === 'string' && body.expirationDate.trim() !== '' ? body.expirationDate : null;
  }
  if (body.clearedBy !== undefined) {
    fields.clearedBy = typeof body.clearedBy === 'string' && body.clearedBy.trim() !== '' ? body.clearedBy : null;
  }
  if (body.clearanceType !== undefined) {
    fields.clearanceType = typeof body.clearanceType === 'string' && clearanceTypes.includes(body.clearanceType) 
      ? body.clearanceType as 'pre-fight' | 'post-fight' | 'annual' | 'emergency' 
      : null;
  }
  if (body.notes !== undefined) {
    fields.notes = typeof body.notes === 'string' && body.notes.trim() !== '' ? body.notes : null;
  }
  if (body.status !== undefined) {
    fields.status = typeof body.status === 'string' && statuses.includes(body.status) 
      ? body.status as 'pending' | 'approved' | 'rejected' 
      : undefined;
  }
  
  const clearance = await s.update(id, fields);
  if (!clearance) {
    return res.status(404).json({ error: 'Medical clearance not found' });
  }
  
  res.json(clearance);
}

export async function deleteById(req: AuthRequest, res: Response) {
  const id = req.params.id;
  await s.remove(id);
  res.status(204).send();
}
