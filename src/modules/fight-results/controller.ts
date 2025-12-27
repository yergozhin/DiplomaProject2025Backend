import { Request, Response } from 'express';
import { AuthRequest } from '@src/middlewares/auth';
import * as s from './service';
import type { CreateResultFields, UpdateResultFields } from './model';

export async function create(req: AuthRequest, res: Response) {
  try {
    const body = req.body as {
      fightId?: unknown;
      winnerId?: unknown;
      resultType?: unknown;
      roundEnded?: unknown;
      timeEnded?: unknown;
      judgeScores?: unknown;
    };
    const fightId = typeof body.fightId === 'string' ? body.fightId : null;
    const winnerId = typeof body.winnerId === 'string' ? body.winnerId : null;
    const resultType = typeof body.resultType === 'string' && ['knockout', 'technical_knockout', 'submission', 'decision', 'draw', 'no_contest', 'disqualification'].includes(body.resultType) ? body.resultType as 'knockout' | 'technical_knockout' | 'submission' | 'decision' | 'draw' | 'no_contest' | 'disqualification' : null;
    const roundEnded = typeof body.roundEnded === 'number' ? body.roundEnded : null;
    const timeEnded = typeof body.timeEnded === 'string' ? body.timeEnded : null;
    const judgeScores = body.judgeScores && typeof body.judgeScores === 'object' && body.judgeScores !== null ? body.judgeScores as Record<string, unknown> : null;
    if (!fightId) {
      return res.status(400).json({ error: 'invalid' });
    }
    const fields: CreateResultFields = {
      fightId,
      winnerId,
      resultType,
      roundEnded,
      timeEnded,
      judgeScores,
    };
    const result = await s.create(fields);
    res.status(201).json(result);
  } catch {
    res.status(500).json({ error: 'Failed to create fight result' });
  }
}

export async function getByFight(req: Request, res: Response) {
  try {
    const fightId = req.params.fightId;
    const result = await s.getByFightId(fightId);
    if (!result) {
      return res.status(404).json({ error: 'Fight result not found' });
    }
    res.json(result);
  } catch {
    res.status(500).json({ error: 'Failed to get fight result' });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const result = await s.getById(id);
    if (!result) {
      return res.status(404).json({ error: 'Fight result not found' });
    }
    res.json(result);
  } catch {
    res.status(500).json({ error: 'Failed to get fight result' });
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id;
    const body = req.body as {
      winnerId?: unknown;
      resultType?: unknown;
      roundEnded?: unknown;
      timeEnded?: unknown;
      judgeScores?: unknown;
    };
    const winnerId = typeof body.winnerId === 'string' ? body.winnerId : null;
    const resultType = typeof body.resultType === 'string' && ['knockout', 'technical_knockout', 'submission', 'decision', 'draw', 'no_contest', 'disqualification'].includes(body.resultType) ? body.resultType as 'knockout' | 'technical_knockout' | 'submission' | 'decision' | 'draw' | 'no_contest' | 'disqualification' : null;
    const roundEnded = typeof body.roundEnded === 'number' ? body.roundEnded : null;
    const timeEnded = typeof body.timeEnded === 'string' ? body.timeEnded : null;
    const judgeScores = body.judgeScores && typeof body.judgeScores === 'object' && body.judgeScores !== null ? body.judgeScores as Record<string, unknown> : null;
    const fields: UpdateResultFields = {
      winnerId,
      resultType,
      roundEnded,
      timeEnded,
      judgeScores,
    };
    const result = await s.update(id, fields);
    if (!result) {
      return res.status(404).json({ error: 'Fight result not found' });
    }
    res.json(result);
  } catch {
    res.status(500).json({ error: 'Failed to update fight result' });
  }
}

export async function deleteById(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id;
    await s.deleteById(id);
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Failed to delete fight result' });
  }
}
