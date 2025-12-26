import { Request, Response } from 'express';
import { AuthRequest } from '@src/middlewares/auth';
import * as s from './service';
import type { CreateClearanceFields, UpdateClearanceFields } from './model';

export async function create(req: AuthRequest, res: Response) {
  try {
    const fields: CreateClearanceFields = {
      fighterId: req.body.fighterId,
      clearanceDate: req.body.clearanceDate,
      expirationDate: req.body.expirationDate,
      clearedBy: req.body.clearedBy,
      clearanceType: req.body.clearanceType,
      notes: req.body.notes,
    };
    const clearance = await s.create(fields);
    res.status(201).json(clearance);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create medical clearance' });
  }
}

export async function getByFighter(req: Request, res: Response) {
  try {
    const fighterId = req.params.fighterId;
    const clearances = await s.getByFighterId(fighterId);
    res.json(clearances);
  } catch (err) {
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
  } catch (err) {
    res.status(500).json({ error: 'Failed to get medical clearance' });
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id;
    const fields: UpdateClearanceFields = {
      clearanceDate: req.body.clearanceDate,
      expirationDate: req.body.expirationDate,
      clearedBy: req.body.clearedBy,
      clearanceType: req.body.clearanceType,
      notes: req.body.notes,
    };
    const clearance = await s.update(id, fields);
    if (!clearance) {
      return res.status(404).json({ error: 'Medical clearance not found' });
    }
    res.json(clearance);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update medical clearance' });
  }
}

export async function deleteById(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id;
    await s.deleteById(id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete medical clearance' });
  }
}

