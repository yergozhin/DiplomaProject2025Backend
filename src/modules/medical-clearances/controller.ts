import { Request, Response } from 'express';
import { AuthRequest } from '@src/middlewares/auth';
import * as s from './service';
import type { CreateClearanceFields, UpdateClearanceFields } from './model';

export async function create(req: AuthRequest, res: Response) {
  try {
    const body = req.body as {
      fighterId?: unknown;
      clearanceDate?: unknown;
      expirationDate?: unknown;
      clearedBy?: unknown;
      clearanceType?: unknown;
      notes?: unknown;
    };
    const fighterId = typeof body.fighterId === 'string' ? body.fighterId : null;
    const clearanceDate = typeof body.clearanceDate === 'string' ? body.clearanceDate : null;
    const expirationDate = typeof body.expirationDate === 'string' ? body.expirationDate : null;
    const clearedBy = typeof body.clearedBy === 'string' ? body.clearedBy : null;
    const clearanceType = typeof body.clearanceType === 'string' && ['pre-fight', 'post-fight', 'annual', 'emergency'].includes(body.clearanceType) ? body.clearanceType as 'pre-fight' | 'post-fight' | 'annual' | 'emergency' : null;
    const notes = typeof body.notes === 'string' ? body.notes : null;
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
      clearanceDate?: unknown;
      expirationDate?: unknown;
      clearedBy?: unknown;
      clearanceType?: unknown;
      notes?: unknown;
    };
    const clearanceDate = typeof body.clearanceDate === 'string' ? body.clearanceDate : undefined;
    const expirationDate = typeof body.expirationDate === 'string' ? body.expirationDate : null;
    const clearedBy = typeof body.clearedBy === 'string' ? body.clearedBy : null;
    const clearanceType = typeof body.clearanceType === 'string' && ['pre-fight', 'post-fight', 'annual', 'emergency'].includes(body.clearanceType) ? body.clearanceType as 'pre-fight' | 'post-fight' | 'annual' | 'emergency' : null;
    const notes = typeof body.notes === 'string' ? body.notes : null;
    const fields: UpdateClearanceFields = {
      clearanceDate,
      expirationDate,
      clearedBy,
      clearanceType,
      notes,
    };
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
