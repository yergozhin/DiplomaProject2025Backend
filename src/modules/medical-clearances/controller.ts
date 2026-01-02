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
    const fighterId = typeof body.fighterId === 'string' ? body.fighterId : null;
    const clearanceDate = typeof body.clearanceDate === 'string' ? body.clearanceDate : null;
    const expirationDate = typeof body.expirationDate === 'string' && body.expirationDate.trim() !== '' ? body.expirationDate : null;
    const clearedBy = typeof body.clearedBy === 'string' && body.clearedBy.trim() !== '' ? body.clearedBy : null;
    const clearanceType = typeof body.clearanceType === 'string' && ['pre-fight', 'post-fight', 'annual', 'emergency'].includes(body.clearanceType) ? body.clearanceType as 'pre-fight' | 'post-fight' | 'annual' | 'emergency' : null;
    const notes = typeof body.notes === 'string' && body.notes.trim() !== '' ? body.notes : null;
    const status = typeof body.status === 'string' && ['pending', 'approved', 'rejected'].includes(body.status) ? body.status as 'pending' | 'approved' | 'rejected' : 'pending';
    if (!fighterId || !clearanceDate) {
      return res.status(400).json({ error: 'invalid' });
    }
    const fields: CreateClearanceFields = {
      fighterId,
      clearanceDate,
      expirationDate,
      clearedBy,
      clearanceType,
      notes,
      status,
    };
    const clearance = await s.create(fields);
    res.status(201).json(clearance);
  } catch {
    res.status(500).json({ error: 'Failed to create medical clearance' });
  }
}

export async function getByFighter(req: Request, res: Response) {
  try {
    const fighterId = req.params.fighterId;
    const clearances = await s.getByFighterId(fighterId);
    res.json(clearances);
  } catch {
    res.status(500).json({ error: 'Failed to get medical clearances' });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const clearance = await s.getById(id);
    if (!clearance) {
      return res.status(404).json({ error: 'Medical clearance not found' });
    }
    res.json(clearance);
  } catch {
    res.status(500).json({ error: 'Failed to get medical clearance' });
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id;
    const body = req.body as {
      clearanceDate?: unknown,
      expirationDate?: unknown,
      clearedBy?: unknown,
      clearanceType?: unknown,
      notes?: unknown,
      status?: unknown,
    };
    const fields: UpdateClearanceFields = {};
    
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
      fields.clearanceType = typeof body.clearanceType === 'string' && ['pre-fight', 'post-fight', 'annual', 'emergency'].includes(body.clearanceType) ? body.clearanceType as 'pre-fight' | 'post-fight' | 'annual' | 'emergency' : null;
    }
    if (body.notes !== undefined) {
      fields.notes = typeof body.notes === 'string' && body.notes.trim() !== '' ? body.notes : null;
    }
    if (body.status !== undefined) {
      fields.status = typeof body.status === 'string' && ['pending', 'approved', 'rejected'].includes(body.status) ? body.status as 'pending' | 'approved' | 'rejected' : undefined;
    }
    const clearance = await s.update(id, fields);
    if (!clearance) {
      return res.status(404).json({ error: 'Medical clearance not found' });
    }
    res.json(clearance);
  } catch {
    res.status(500).json({ error: 'Failed to update medical clearance' });
  }
}

export async function deleteById(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id;
    await s.deleteById(id);
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Failed to delete medical clearance' });
  }
}
