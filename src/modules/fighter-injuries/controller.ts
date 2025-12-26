import { Request, Response } from 'express';
import { AuthRequest } from '@src/middlewares/auth';
import * as s from './service';
import type { CreateInjuryFields, UpdateInjuryFields } from './model';

export async function create(req: AuthRequest, res: Response) {
  try {
    const fields: CreateInjuryFields = {
      fighterId: req.body.fighterId,
      injuryType: req.body.injuryType,
      injuryDescription: req.body.injuryDescription,
      injuryDate: req.body.injuryDate,
      recoveryStatus: req.body.recoveryStatus,
      medicalNotes: req.body.medicalNotes,
    };
    const injury = await s.create(fields);
    res.status(201).json(injury);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create injury record' });
  }
}

export async function getByFighter(req: Request, res: Response) {
  try {
    const fighterId = req.params.fighterId;
    const injuries = await s.getByFighterId(fighterId);
    res.json(injuries);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get injuries' });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const injury = await s.getById(id);
    if (!injury) {
      return res.status(404).json({ error: 'Injury not found' });
    }
    res.json(injury);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get injury' });
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id;
    const fields: UpdateInjuryFields = {
      injuryType: req.body.injuryType,
      injuryDescription: req.body.injuryDescription,
      injuryDate: req.body.injuryDate,
      recoveryStatus: req.body.recoveryStatus,
      medicalNotes: req.body.medicalNotes,
    };
    const injury = await s.update(id, fields);
    if (!injury) {
      return res.status(404).json({ error: 'Injury not found' });
    }
    res.json(injury);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update injury' });
  }
}

export async function deleteById(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id;
    await s.deleteById(id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete injury' });
  }
}

