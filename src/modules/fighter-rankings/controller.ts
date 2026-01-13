import { Request, Response } from 'express';
import { AuthRequest } from '@src/middlewares/auth';
import * as s from './service';
import type { CreateRankingFields, UpdateRankingFields } from './model';

export async function create(req: AuthRequest, res: Response) {
  try {
    const { fighterId, weightClassId, rankingPosition, rankingPoints, rankingDate } = req.body as any;
    
    if (!fighterId || !weightClassId || !rankingDate) {
      return res.status(400).json({ error: 'invalid' });
    }
    
    const fields: CreateRankingFields = {
      fighterId,
      weightClassId,
      rankingPosition: typeof rankingPosition === 'number' ? rankingPosition : null,
      rankingPoints: typeof rankingPoints === 'number' ? rankingPoints : 0,
      rankingDate,
    };
    
    const ranking = await s.create(fields);
    res.status(201).json(ranking);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'invalid' });
  }
}

export function getByFighter(req: Request, res: Response) {
  const fighterId = req.params.fighterId;
  s.getByFighterId(fighterId).then(rankings => {
    res.json(rankings);
  });
}

export async function getByWeightClass(req: Request, res: Response) {
  const weightClassId = req.params.weightClassId;
  const rankings = await s.getByWeightClass(weightClassId);
  res.json(rankings);
}

export function getById(req: Request, res: Response) {
  const id = req.params.id;
  s.getById(id).then(ranking => {
    if (!ranking) {
      res.status(404).json({ error: 'not found' });
    } else {
      res.json(ranking);
    }
  });
}

export async function update(req: AuthRequest, res: Response) {
  const id = req.params.id;
  const body = req.body as any;
  
  const rankingPosition = typeof body.rankingPosition === 'number' ? body.rankingPosition : null;
  const rankingPoints = typeof body.rankingPoints === 'number' ? body.rankingPoints : undefined;
  const rankingDate = typeof body.rankingDate === 'string' ? body.rankingDate : undefined;
  
  const fields: UpdateRankingFields = {
    rankingPosition,
    rankingPoints,
    rankingDate,
  };
  
  const ranking = await s.update(id, fields);
  if (!ranking) {
    return res.status(404).json({ error: 'Ranking not found' });
  }
  
  res.json(ranking);
}

export async function getAllLatest(req: Request, res: Response) {
  const rankings = await s.getAllLatest();
  res.json(rankings);
}

export async function deleteById(req: AuthRequest, res: Response) {
  const id = req.params.id;
  await s.remove(id);
  res.status(204).send();
}

