import { Request, Response } from 'express';
import { AuthRequest } from '@src/middlewares/auth';
import * as s from './service';
import type { CreateStatisticsFields, UpdateStatisticsFields } from './model';

export async function create(req: AuthRequest, res: Response) {
  try {
    const fields: CreateStatisticsFields = {
      ploId: req.body.ploId,
      totalEvents: req.body.totalEvents,
      completedEvents: req.body.completedEvents,
      totalFightsOrganized: req.body.totalFightsOrganized,
      statisticsDate: req.body.statisticsDate,
    };
    const statistics = await s.create(fields);
    res.status(201).json(statistics);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create PLO event statistics' });
  }
}

export async function getByPlo(req: Request, res: Response) {
  try {
    const ploId = req.params.ploId;
    const statistics = await s.getByPloId(ploId);
    res.json(statistics);
  } catch (err) {
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
  } catch (err) {
    res.status(500).json({ error: 'Failed to get PLO event statistics' });
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id;
    const fields: UpdateStatisticsFields = {
      totalEvents: req.body.totalEvents,
      completedEvents: req.body.completedEvents,
      totalFightsOrganized: req.body.totalFightsOrganized,
      statisticsDate: req.body.statisticsDate,
    };
    const statistics = await s.update(id, fields);
    if (!statistics) {
      return res.status(404).json({ error: 'PLO event statistics not found' });
    }
    res.json(statistics);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update PLO event statistics' });
  }
}

export async function deleteById(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id;
    await s.deleteById(id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete PLO event statistics' });
  }
}

