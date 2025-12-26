import { Request, Response } from 'express';
import { AuthRequest } from '@src/middlewares/auth';
import * as s from './service';
import type { CreateRankingFields, UpdateRankingFields } from './model';

export async function create(req: AuthRequest, res: Response) {
  try {
    const fields: CreateRankingFields = {
      fighterId: req.body.fighterId,
      weightClassId: req.body.weightClassId,
      rankingPosition: req.body.rankingPosition ?? null,
      rankingPoints: req.body.rankingPoints ?? 0,
      rankingDate: req.body.rankingDate,
    };
    const ranking = await s.create(fields);
    res.status(201).json(ranking);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create ranking' });
  }
}

export async function getByFighter(req: Request, res: Response) {
  try {
    const fighterId = req.params.fighterId;
    const rankings = await s.getByFighterId(fighterId);
    res.json(rankings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get rankings' });
  }
}

export async function getByWeightClass(req: Request, res: Response) {
  try {
    const weightClassId = req.params.weightClassId;
    const rankings = await s.getByWeightClass(weightClassId);
    res.json(rankings);
  } catch (err) {
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
  } catch (err) {
    res.status(500).json({ error: 'Failed to get ranking' });
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id;
    const fields: UpdateRankingFields = {
      rankingPosition: req.body.rankingPosition,
      rankingPoints: req.body.rankingPoints,
      rankingDate: req.body.rankingDate,
    };
    const ranking = await s.update(id, fields);
    if (!ranking) {
      return res.status(404).json({ error: 'Ranking not found' });
    }
    res.json(ranking);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update ranking' });
  }
}

export async function deleteById(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id;
    await s.deleteById(id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete ranking' });
  }
}

