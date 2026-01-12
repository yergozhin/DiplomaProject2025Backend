import { Request, Response } from 'express';
import { AuthRequest } from '@src/middlewares/auth';
import * as s from './service';
import type { CreateStatusHistoryFields } from './model';

export async function create(req: AuthRequest, res: Response) {
  const body = req.body as any;
  const validStatuses = ['draft', 'published', 'cancelled', 'rejected', 'completed'];
  
  if (!body.eventId || !body.status || !validStatuses.includes(body.status)) {
    return res.status(400).json({ error: 'invalid' });
  }
  
  const changedBy = req.user?.userId || null;
  
  const fields: CreateStatusHistoryFields = {
    eventId: body.eventId,
    status: body.status,
    changedBy,
    changeReason: body.changeReason || null,
  };
  
  const history = await s.create(fields);
  
  res.status(201).json(history);
}

export async function getByEvent(req: Request, res: Response) {
  const eventId = req.params.eventId;
  const histories = await s.getByEventId(eventId);
  res.json(histories);
}

export async function getById(req: Request, res: Response) {
  const id = req.params.id;
  const history = await s.getById(id);
  if (!history) {
    return res.status(404).json({ error: 'Event status history not found' });
  }
  res.json(history);
}
