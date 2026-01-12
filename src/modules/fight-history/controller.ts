import { Request, Response } from 'express';
import { AuthRequest } from '@src/middlewares/auth';
import * as s from './service';
import type { CreateHistoryFields } from './model';

export async function create(req: AuthRequest, res: Response) {
  try {
    const body = req.body as any;
    
    const fightId = typeof body.fightId === 'string' ? body.fightId : null;
    const status = typeof body.status === 'string' ? body.status : null;
    const changeReason = typeof body.changeReason === 'string' ? body.changeReason : null;
    const changedBy: string | null = req.user && typeof req.user.userId === 'string' ? req.user.userId : null;
    
    if (!fightId || !status) {
      return res.status(400).json({ error: 'invalid' });
    }
    
    const fields: CreateHistoryFields = {
      fightId,
      status,
      changedBy,
      changeReason,
    };
    
    const history = await s.create(fields);
    
    res.status(201).json(history);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'invalid' });
  }
}

export async function getByFight(req: Request, res: Response) {
  const fightId = req.params.fightId;
  const histories = await s.getByFightId(fightId);
  res.json(histories);
}

export async function getById(req: Request, res: Response) {
  const id = req.params.id;
  const history = await s.getById(id);
  if (!history) {
    return res.status(404).json({ error: 'Fight history not found' });
  }
  res.json(history);
}
