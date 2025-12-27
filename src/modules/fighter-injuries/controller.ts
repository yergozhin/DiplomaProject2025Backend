import { Request, Response } from 'express';
import { AuthRequest } from '@src/middlewares/auth';
import * as s from './service';
import type { CreateInjuryFields, UpdateInjuryFields } from './model';

export async function create(req: AuthRequest, res: Response) {
  try {
    const body = req.body as {
      fighterId?: unknown;
      injuryType?: unknown;
      injuryDescription?: unknown;
      injuryDate?: unknown;
      recoveryStatus?: unknown;
      medicalNotes?: unknown;
    };
    const fighterId = typeof body.fighterId === 'string' ? body.fighterId : null;
    const injuryType = typeof body.injuryType === 'string' ? body.injuryType : null;
    const injuryDescription = typeof body.injuryDescription === 'string' ? body.injuryDescription : null;
    const injuryDate = typeof body.injuryDate === 'string' ? body.injuryDate : null;
    const recoveryStatus = typeof body.recoveryStatus === 'string' && ['recovering', 'cleared', 'ongoing'].includes(body.recoveryStatus) ? body.recoveryStatus as 'recovering' | 'cleared' | 'ongoing' : null;
    const medicalNotes = typeof body.medicalNotes === 'string' ? body.medicalNotes : null;
    if (!fighterId || !injuryType) {
      return res.status(400).json({ error: 'invalid' });
    }
    const fields: CreateInjuryFields = {
      fighterId,
      injuryType,
      injuryDescription,
      injuryDate,
      recoveryStatus,
      medicalNotes,
    };
    const injury = await s.create(fields);
    res.status(201).json(injury);
  } catch {
    res.status(500).json({ error: 'Failed to create injury record' });
  }
}

export async function getByFighter(req: Request, res: Response) {
  try {
    const fighterId = req.params.fighterId;
    const injuries = await s.getByFighterId(fighterId);
    res.json(injuries);
  } catch {
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
  } catch {
    res.status(500).json({ error: 'Failed to get injury' });
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id;
    const body = req.body as {
      injuryType?: unknown;
      injuryDescription?: unknown;
      injuryDate?: unknown;
      recoveryStatus?: unknown;
      medicalNotes?: unknown;
    };
    const injuryType = typeof body.injuryType === 'string' ? body.injuryType : undefined;
    const injuryDescription = typeof body.injuryDescription === 'string' ? body.injuryDescription : null;
    const injuryDate = typeof body.injuryDate === 'string' ? body.injuryDate : null;
    const recoveryStatus = typeof body.recoveryStatus === 'string' && ['recovering', 'cleared', 'ongoing'].includes(body.recoveryStatus) ? body.recoveryStatus as 'recovering' | 'cleared' | 'ongoing' : null;
    const medicalNotes = typeof body.medicalNotes === 'string' ? body.medicalNotes : null;
    const fields: UpdateInjuryFields = {
      injuryType,
      injuryDescription,
      injuryDate,
      recoveryStatus,
      medicalNotes,
    };
    const injury = await s.update(id, fields);
    if (!injury) {
      return res.status(404).json({ error: 'Injury not found' });
    }
    res.json(injury);
  } catch {
    res.status(500).json({ error: 'Failed to update injury' });
  }
}

export async function deleteById(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id;
    await s.deleteById(id);
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Failed to delete injury' });
  }
}
