import { Request, Response } from 'express';
import { AuthRequest } from '@src/middlewares/auth';
import * as s from './service';
import type { CreateResultFields, UpdateResultFields } from './model';

export async function create(req: AuthRequest, res: Response) {
  try {
    const body = req.body as {
      fightId?: unknown,
      winnerId?: unknown,
      resultType?: unknown,
      roundEnded?: unknown,
      timeEnded?: unknown,
      judgeScores?: unknown,
    };
    
    if (typeof body.fightId !== 'string' || !body.fightId) {
      return res.status(400).json({ error: 'invalid' });
    }
    
    const resultTypes = ['knockout', 'technical_knockout', 'submission', 'decision', 'draw', 'no_contest', 'disqualification'];
    const resultType = typeof body.resultType === 'string' && resultTypes.includes(body.resultType)
      ? body.resultType as 'knockout' | 'technical_knockout' | 'submission' | 'decision' | 'draw' | 'no_contest' | 'disqualification'
      : null;
    
    const fields: CreateResultFields = {
      fightId: body.fightId,
      winnerId: typeof body.winnerId === 'string' ? body.winnerId : null,
      resultType,
      roundEnded: typeof body.roundEnded === 'number' ? body.roundEnded : null,
      timeEnded: typeof body.timeEnded === 'string' ? body.timeEnded : null,
      judgeScores: body.judgeScores && typeof body.judgeScores === 'object' && body.judgeScores !== null ? body.judgeScores as Record<string, unknown> : null,
    };
    
    const result = await s.create(fields);
    res.status(201).json(result);
  } catch (err: unknown) {
    const message = err && typeof err === 'object' && 'message' in err && typeof err.message === 'string' ? err.message : 'invalid';
    res.status(400).json({ error: message });
  }
}

export async function getByFight(req: Request, res: Response) {
  const fightId = req.params.fightId;
  const result = await s.getByFightId(fightId);
  if (!result) {
    return res.status(404).json({ error: 'Fight result not found' });
  }
  res.json(result);
}

export async function getById(req: Request, res: Response) {
  const id = req.params.id;
  const result = await s.getById(id);
  if (!result) {
    return res.status(404).json({ error: 'Fight result not found' });
  }
  res.json(result);
}

export async function update(req: AuthRequest, res: Response) {
  const id = req.params.id;
  const body = req.body as {
    winnerId?: unknown,
    resultType?: unknown,
    roundEnded?: unknown,
    timeEnded?: unknown,
    judgeScores?: unknown,
  };
  
  const resultTypes = ['knockout', 'technical_knockout', 'submission', 'decision', 'draw', 'no_contest', 'disqualification'];
  const winnerId = typeof body.winnerId === 'string' ? body.winnerId : null;
  const resultType = typeof body.resultType === 'string' && resultTypes.includes(body.resultType) 
    ? body.resultType as 'knockout' | 'technical_knockout' | 'submission' | 'decision' | 'draw' | 'no_contest' | 'disqualification' 
    : null;
  const roundEnded = typeof body.roundEnded === 'number' ? body.roundEnded : null;
  const timeEnded = typeof body.timeEnded === 'string' ? body.timeEnded : null;
  const judgeScores = body.judgeScores && typeof body.judgeScores === 'object' && body.judgeScores !== null 
    ? body.judgeScores as Record<string, unknown> 
    : null;
  
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
}

export async function deleteById(req: AuthRequest, res: Response) {
  const id = req.params.id;
  await s.remove(id);
  res.status(204).send();
}
