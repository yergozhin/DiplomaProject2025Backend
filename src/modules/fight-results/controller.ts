import { Request, Response } from 'express';
import { AuthRequest } from '@src/middlewares/auth';
import * as s from './service';
import type { CreateResultFields, UpdateResultFields } from './model';

export async function create(req: AuthRequest, res: Response) {
  try {
    const fields: CreateResultFields = {
      fightId: req.body.fightId,
      winnerId: req.body.winnerId,
      resultType: req.body.resultType,
      roundEnded: req.body.roundEnded,
      timeEnded: req.body.timeEnded,
      judgeScores: req.body.judgeScores,
    };
    const result = await s.create(fields);
    res.status(201).json(result);
  } catch (err) {
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
  } catch (err) {
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
  } catch (err) {
    res.status(500).json({ error: 'Failed to get fight result' });
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id;
    const fields: UpdateResultFields = {
      winnerId: req.body.winnerId,
      resultType: req.body.resultType,
      roundEnded: req.body.roundEnded,
      timeEnded: req.body.timeEnded,
      judgeScores: req.body.judgeScores,
    };
    const result = await s.update(id, fields);
    if (!result) {
      return res.status(404).json({ error: 'Fight result not found' });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update fight result' });
  }
}

export async function deleteById(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id;
    await s.deleteById(id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete fight result' });
  }
}

