import { Request, Response } from 'express';
import { AuthRequest } from '@src/middlewares/auth';
import * as s from './service';
import type { CreateStatisticsFields, UpdateStatisticsFields } from './model';

export async function create(req: AuthRequest, res: Response) {
  const { ploId, totalEvents, completedEvents, totalFightsOrganized, statisticsDate } = req.body as {
    ploId?: unknown,
    totalEvents?: unknown,
    completedEvents?: unknown,
    totalFightsOrganized?: unknown,
    statisticsDate?: unknown,
  };
  
  if (typeof ploId !== 'string' || !ploId || typeof statisticsDate !== 'string' || !statisticsDate) {
    return res.status(400).json({ error: 'invalid' });
  }
  
  const fields: CreateStatisticsFields = {
    ploId,
    totalEvents: typeof totalEvents === 'number' ? totalEvents : 0,
    completedEvents: typeof completedEvents === 'number' ? completedEvents : 0,
    totalFightsOrganized: typeof totalFightsOrganized === 'number' ? totalFightsOrganized : 0,
    statisticsDate,
  };
  
  try {
    const statistics = await s.create(fields);
    res.status(201).json(statistics);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'invalid' });
  }
}

export async function getByPlo(req: Request, res: Response) {
  const ploId = req.params.ploId;
  const stats = await s.getByPloId(ploId);
  res.json(stats);
}

export async function getById(req: Request, res: Response) {
  const id = req.params.id;
  const statistics = await s.getById(id);
  if (!statistics) {
    return res.status(404).json({ error: 'PLO event statistics not found' });
  }
  res.json(statistics);
}

export async function update(req: AuthRequest, res: Response) {
  const id = req.params.id;
  const body = req.body as {
    totalEvents?: unknown,
    completedEvents?: unknown,
    totalFightsOrganized?: unknown,
    statisticsDate?: unknown,
  };
  
  const totalEvents = typeof body.totalEvents === 'number' ? body.totalEvents : undefined;
  const completedEvents = typeof body.completedEvents === 'number' ? body.completedEvents : undefined;
  const totalFightsOrganized = typeof body.totalFightsOrganized === 'number' ? body.totalFightsOrganized : undefined;
  const statisticsDate = typeof body.statisticsDate === 'string' ? body.statisticsDate : undefined;
  
  const fields: UpdateStatisticsFields = {
    totalEvents,
    completedEvents,
    totalFightsOrganized,
    statisticsDate,
  };
  
  const statistics = await s.update(id, fields);
  if (!statistics) {
    return res.status(404).json({ error: 'PLO event statistics not found' });
  }
  
  res.json(statistics);
}

export async function deleteById(req: AuthRequest, res: Response) {
  const id = req.params.id;
  await s.remove(id);
  res.status(204).send();
}
