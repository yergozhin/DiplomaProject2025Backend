import { Request, Response } from 'express';
import { AuthRequest } from '@src/middlewares/auth';
import * as s from './service';
import type { CreateCategoryFields, UpdateCategoryFields } from './model';

export async function create(req: AuthRequest, res: Response) {
  try {
    const body = req.body as { name?: unknown, description?: unknown };
    const name = typeof body.name === 'string' ? body.name : null;
    const description = typeof body.description === 'string' ? body.description : null;
    if (!name) {
      return res.status(400).json({ error: 'invalid' });
    }
    const fields: CreateCategoryFields = {
      name,
      description,
    };
    const category = await s.create(fields);
    res.status(201).json(category);
  } catch {
    res.status(500).json({ error: 'Failed to create event category' });
  }
}

export async function getAll(req: Request, res: Response) {
  try {
    const categories = await s.all();
    res.json(categories);
  } catch {
    res.status(500).json({ error: 'Failed to get event categories' });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const category = await s.getById(id);
    if (!category) {
      return res.status(404).json({ error: 'Event category not found' });
    }
    res.json(category);
  } catch {
    res.status(500).json({ error: 'Failed to get event category' });
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id;
    const body = req.body as { name?: unknown, description?: unknown };
    const name = typeof body.name === 'string' ? body.name : null;
    const description = typeof body.description === 'string' ? body.description : null;
    if (!name) {
      return res.status(400).json({ error: 'invalid' });
    }
    const fields: UpdateCategoryFields = {
      name,
      description,
    };
    const category = await s.update(id, fields);
    if (!category) {
      return res.status(404).json({ error: 'Event category not found' });
    }
    res.json(category);
  } catch {
    res.status(500).json({ error: 'Failed to update event category' });
  }
}

export async function deleteById(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id;
    await s.deleteById(id);
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Failed to delete event category' });
  }
}

export async function assignToEvent(req: AuthRequest, res: Response) {
  try {
    const eventId = req.params.eventId;
    const body = req.body as { categoryId?: unknown };
    const categoryId = typeof body.categoryId === 'string' ? body.categoryId : null;
    if (!categoryId) {
      return res.status(400).json({ error: 'invalid' });
    }
    const assignment = await s.assignToEvent(eventId, categoryId);
    res.status(201).json(assignment);
  } catch {
    res.status(500).json({ error: 'Failed to assign category to event' });
  }
}

export async function removeFromEvent(req: AuthRequest, res: Response) {
  try {
    const eventId = req.params.eventId;
    const categoryId = req.params.categoryId;
    await s.removeFromEvent(eventId, categoryId);
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Failed to remove category from event' });
  }
}

export async function getByEvent(req: Request, res: Response) {
  try {
    const eventId = req.params.eventId;
    const assignments = await s.getByEventId(eventId);
    res.json(assignments);
  } catch {
    res.status(500).json({ error: 'Failed to get event categories' });
  }
}

