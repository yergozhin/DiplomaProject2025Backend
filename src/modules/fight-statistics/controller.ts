import { Request, Response } from 'express';
import { AuthRequest } from '@src/middlewares/auth';
import * as s from './service';
import type { CreateStatisticFields, UpdateStatisticFields } from './model';

export async function create(req: AuthRequest, res: Response) {
  try {
    const fields: CreateStatisticFields = {
      fightId: req.body.fightId,
      fighterId: req.body.fighterId,
      strikesLanded: req.body.strikesLanded,
      strikesAttempted: req.body.strikesAttempted,
      takedownsLanded: req.body.takedownsLanded,
      takedownsAttempted: req.body.takedownsAttempted,
      submissionAttempts: req.body.submissionAttempts,
      controlTimeSeconds: req.body.controlTimeSeconds,
    };
    const statistic = await s.create(fields);
    res.status(201).json(statistic);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create fight statistic' });
  }
}

export async function getByFight(req: Request, res: Response) {
  try {
    const fightId = req.params.fightId;
    const statistics = await s.getByFightId(fightId);
    res.json(statistics);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get fight statistics' });
  }
}

export async function getByFighter(req: Request, res: Response) {
  try {
    const fighterId = req.params.fighterId;
    const statistics = await s.getByFighterId(fighterId);
    res.json(statistics);
  } catch (err) {
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
  } catch (err) {
    res.status(500).json({ error: 'Failed to get fight statistic' });
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id;
    const fields: UpdateStatisticFields = {
      strikesLanded: req.body.strikesLanded,
      strikesAttempted: req.body.strikesAttempted,
      takedownsLanded: req.body.takedownsLanded,
      takedownsAttempted: req.body.takedownsAttempted,
      submissionAttempts: req.body.submissionAttempts,
      controlTimeSeconds: req.body.controlTimeSeconds,
    };
    const statistic = await s.update(id, fields);
    if (!statistic) {
      return res.status(404).json({ error: 'Fight statistic not found' });
    }
    res.json(statistic);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update fight statistic' });
  }
}

export async function deleteById(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id;
    await s.deleteById(id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete fight statistic' });
  }
}

