import { Request, Response } from 'express';
import { AuthRequest } from '@src/middlewares/auth';
import * as s from './service';
import type { CreateStatusHistoryFields } from './model';

export async function create(req: AuthRequest, res: Response) {
  try {
    const fields: CreateStatusHistoryFields = {
      eventId: req.body.eventId,
      status: req.body.status,
      changedBy: req.user?.id || null,
      changeReason: req.body.changeReason,
    };
    const history = await s.create(fields);
    res.status(201).json(history);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create event status history' });
  }
}

export async function getByEvent(req: Request, res: Response) {
  try {
    const eventId = req.params.eventId;
    const histories = await s.getByEventId(eventId);
    res.json(histories);
  } catch (err) {
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
  } catch (err) {
    res.status(500).json({ error: 'Failed to get event status history' });
  }
}

