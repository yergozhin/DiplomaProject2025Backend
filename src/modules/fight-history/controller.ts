import { Request, Response } from 'express';
import { AuthRequest } from '@src/middlewares/auth';
import * as s from './service';
import type { CreateHistoryFields } from './model';

export async function create(req: AuthRequest, res: Response) {
  try {
    const fields: CreateHistoryFields = {
      fightId: req.body.fightId,
      status: req.body.status,
      changedBy: req.user?.id || null,
      changeReason: req.body.changeReason,
    };
    const history = await s.create(fields);
    res.status(201).json(history);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create fight history' });
  }
}

export async function getByFight(req: Request, res: Response) {
  try {
    const fightId = req.params.fightId;
    const histories = await s.getByFightId(fightId);
    res.json(histories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get fight history' });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const history = await s.getById(id);
    if (!history) {
      return res.status(404).json({ error: 'Fight history not found' });
    }
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get fight history' });
  }
}

