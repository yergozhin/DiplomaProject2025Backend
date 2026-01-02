import { Request, Response } from 'express';
import { AuthRequest } from '@src/middlewares/auth';
import * as s from './service';
import type { CreateStatusHistoryFields } from './model';

export async function create(req: AuthRequest, res: Response) {
  try {
    const body = req.body as {
      eventId?: unknown,
      status?: unknown,
      changeReason?: unknown,
    };
    const eventId = typeof body.eventId === 'string' ? body.eventId : null;
    const status = typeof body.status === 'string' && ['draft', 'published', 'cancelled', 'rejected', 'completed'].includes(body.status) ? body.status as 'draft' | 'published' | 'cancelled' | 'rejected' | 'completed' : null;
    const changeReason = typeof body.changeReason === 'string' ? body.changeReason : null;
    const changedBy: string | null = req.user && typeof req.user.userId === 'string' ? req.user.userId : null;
    if (!eventId || !status) {
      return res.status(400).json({ error: 'invalid' });
    }
    const fields: CreateStatusHistoryFields = {
      eventId,
      status,
      changedBy,
      changeReason,
    };
    const history = await s.create(fields);
    res.status(201).json(history);
  } catch {
    res.status(500).json({ error: 'Failed to create event status history' });
  }
}

export async function getByEvent(req: Request, res: Response) {
  try {
    const eventId = req.params.eventId;
    const histories = await s.getByEventId(eventId);
    res.json(histories);
  } catch {
    res.status(500).json({ error: 'Failed to get event status history' });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const history = await s.getById(id);
    if (!history) {
      return res.status(404).json({ error: 'Event status history not found' });
    }
    res.json(history);
  } catch {
    res.status(500).json({ error: 'Failed to get event status history' });
  }
}
