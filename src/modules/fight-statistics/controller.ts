import { Request, Response } from 'express';
import { AuthRequest } from '@src/middlewares/auth';
import * as s from './service';
import type { CreateStatisticFields, UpdateStatisticFields } from './model';

export async function create(req: AuthRequest, res: Response) {
  try {
    const body = req.body as {
      fightId?: unknown,
      fighterId?: unknown,
      strikesLanded?: unknown,
      strikesAttempted?: unknown,
      takedownsLanded?: unknown,
      takedownsAttempted?: unknown,
      submissionAttempts?: unknown,
      controlTimeSeconds?: unknown,
    };
    const fightId = typeof body.fightId === 'string' ? body.fightId : null;
    const fighterId = typeof body.fighterId === 'string' ? body.fighterId : null;
    const strikesLanded = typeof body.strikesLanded === 'number' ? body.strikesLanded : 0;
    const strikesAttempted = typeof body.strikesAttempted === 'number' ? body.strikesAttempted : 0;
    const takedownsLanded = typeof body.takedownsLanded === 'number' ? body.takedownsLanded : 0;
    const takedownsAttempted = typeof body.takedownsAttempted === 'number' ? body.takedownsAttempted : 0;
    const submissionAttempts = typeof body.submissionAttempts === 'number' ? body.submissionAttempts : 0;
    const controlTimeSeconds = typeof body.controlTimeSeconds === 'number' ? body.controlTimeSeconds : 0;
    if (!fightId || !fighterId) {
      return res.status(400).json({ error: 'invalid' });
    }
    const fields: CreateStatisticFields = {
      fightId,
      fighterId,
      strikesLanded,
      strikesAttempted,
      takedownsLanded,
      takedownsAttempted,
      submissionAttempts,
      controlTimeSeconds,
    };
    const statistic = await s.create(fields);
    res.status(201).json(statistic);
  } catch {
    res.status(500).json({ error: 'Failed to create fight statistic' });
  }
}

export async function getByFight(req: Request, res: Response) {
  try {
    const fightId = req.params.fightId;
    const statistics = await s.getByFightId(fightId);
    res.json(statistics);
  } catch {
    res.status(500).json({ error: 'Failed to get fight statistics' });
  }
}

export async function getByFighter(req: Request, res: Response) {
  try {
    const fighterId = req.params.fighterId;
    const statistics = await s.getByFighterId(fighterId);
    res.json(statistics);
  } catch {
    res.status(500).json({ error: 'Failed to get fight statistics' });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const statistic = await s.getById(id);
    if (!statistic) {
      return res.status(404).json({ error: 'Fight statistic not found' });
    }
    res.json(statistic);
  } catch {
    res.status(500).json({ error: 'Failed to get fight statistic' });
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id;
    const body = req.body as {
      strikesLanded?: unknown,
      strikesAttempted?: unknown,
      takedownsLanded?: unknown,
      takedownsAttempted?: unknown,
      submissionAttempts?: unknown,
      controlTimeSeconds?: unknown,
    };
    const strikesLanded = typeof body.strikesLanded === 'number' ? body.strikesLanded : undefined;
    const strikesAttempted = typeof body.strikesAttempted === 'number' ? body.strikesAttempted : undefined;
    const takedownsLanded = typeof body.takedownsLanded === 'number' ? body.takedownsLanded : undefined;
    const takedownsAttempted = typeof body.takedownsAttempted === 'number' ? body.takedownsAttempted : undefined;
    const submissionAttempts = typeof body.submissionAttempts === 'number' ? body.submissionAttempts : undefined;
    const controlTimeSeconds = typeof body.controlTimeSeconds === 'number' ? body.controlTimeSeconds : undefined;
    const fields: UpdateStatisticFields = {
      strikesLanded,
      strikesAttempted,
      takedownsLanded,
      takedownsAttempted,
      submissionAttempts,
      controlTimeSeconds,
    };
    const statistic = await s.update(id, fields);
    if (!statistic) {
      return res.status(404).json({ error: 'Fight statistic not found' });
    }
    res.json(statistic);
  } catch {
    res.status(500).json({ error: 'Failed to update fight statistic' });
  }
}

export async function deleteById(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id;
    await s.deleteById(id);
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Failed to delete fight statistic' });
  }
}
