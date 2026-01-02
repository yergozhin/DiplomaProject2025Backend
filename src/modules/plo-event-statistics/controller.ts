import { Request, Response } from 'express';
import { AuthRequest } from '@src/middlewares/auth';
import * as s from './service';
import type { CreateStatisticsFields, UpdateStatisticsFields } from './model';

export async function create(req: AuthRequest, res: Response) {
  try {
    const body = req.body as {
      ploId?: unknown,
      totalEvents?: unknown,
      completedEvents?: unknown,
      totalFightsOrganized?: unknown,
      statisticsDate?: unknown,
    };
    const ploId = typeof body.ploId === 'string' ? body.ploId : null;
    const totalEvents = typeof body.totalEvents === 'number' ? body.totalEvents : 0;
    const completedEvents = typeof body.completedEvents === 'number' ? body.completedEvents : 0;
    const totalFightsOrganized = typeof body.totalFightsOrganized === 'number' ? body.totalFightsOrganized : 0;
    const statisticsDate = typeof body.statisticsDate === 'string' ? body.statisticsDate : null;
    if (!ploId || !statisticsDate) {
      return res.status(400).json({ error: 'invalid' });
    }
    const fields: CreateStatisticsFields = {
      ploId,
      totalEvents,
      completedEvents,
      totalFightsOrganized,
      statisticsDate,
    };
    const statistics = await s.create(fields);
    res.status(201).json(statistics);
  } catch {
    res.status(500).json({ error: 'Failed to create PLO event statistics' });
  }
}

export async function getByPlo(req: Request, res: Response) {
  try {
    const ploId = req.params.ploId;
    const statistics = await s.getByPloId(ploId);
    res.json(statistics);
  } catch {
    res.status(500).json({ error: 'Failed to get PLO event statistics' });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const statistics = await s.getById(id);
    if (!statistics) {
      return res.status(404).json({ error: 'PLO event statistics not found' });
    }
    res.json(statistics);
  } catch {
    res.status(500).json({ error: 'Failed to get PLO event statistics' });
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
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
  } catch {
    res.status(500).json({ error: 'Failed to update PLO event statistics' });
  }
}

export async function deleteById(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id;
    await s.deleteById(id);
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Failed to delete PLO event statistics' });
  }
}
