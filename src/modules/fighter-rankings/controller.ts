import { Request, Response } from 'express';
import { AuthRequest } from '@src/middlewares/auth';
import * as s from './service';
import type { CreateRankingFields, UpdateRankingFields } from './model';

export async function create(req: AuthRequest, res: Response) {
  try {
    const body = req.body as {
      fighterId?: unknown,
      weightClassId?: unknown,
      rankingPosition?: unknown,
      rankingPoints?: unknown,
      rankingDate?: unknown,
    };
    const fighterId = typeof body.fighterId === 'string' ? body.fighterId : null;
    const weightClassId = typeof body.weightClassId === 'string' ? body.weightClassId : null;
    const rankingPosition = typeof body.rankingPosition === 'number' ? body.rankingPosition : null;
    const rankingPoints = typeof body.rankingPoints === 'number' ? body.rankingPoints : 0;
    const rankingDate = typeof body.rankingDate === 'string' ? body.rankingDate : null;
    if (!fighterId || !weightClassId || !rankingDate) {
      return res.status(400).json({ error: 'invalid' });
    }
    const fields: CreateRankingFields = {
      fighterId,
      weightClassId,
      rankingPosition,
      rankingPoints,
      rankingDate,
    };
    const ranking = await s.create(fields);
    res.status(201).json(ranking);
  } catch {
    res.status(500).json({ error: 'Failed to create ranking' });
  }
}

export async function getByFighter(req: Request, res: Response) {
  try {
    const fighterId = req.params.fighterId;
    const rankings = await s.getByFighterId(fighterId);
    res.json(rankings);
  } catch {
    res.status(500).json({ error: 'Failed to get rankings' });
  }
}

export async function getByWeightClass(req: Request, res: Response) {
  try {
    const weightClassId = req.params.weightClassId;
    const rankings = await s.getByWeightClass(weightClassId);
    res.json(rankings);
  } catch {
    res.status(500).json({ error: 'Failed to get rankings' });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const ranking = await s.getById(id);
    if (!ranking) {
      return res.status(404).json({ error: 'Ranking not found' });
    }
    res.json(ranking);
  } catch {
    res.status(500).json({ error: 'Failed to get ranking' });
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id;
    const body = req.body as {
      rankingPosition?: unknown,
      rankingPoints?: unknown,
      rankingDate?: unknown,
    };
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
  } catch {
    res.status(500).json({ error: 'Failed to update ranking' });
  }
}

export async function getAllLatest(req: Request, res: Response) {
  try {
    const rankings = await s.getAllLatest();
    res.json(rankings);
  } catch {
    res.status(500).json({ error: 'Failed to get rankings' });
  }
}

export async function deleteById(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id;
    await s.deleteById(id);
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Failed to delete ranking' });
  }
}

