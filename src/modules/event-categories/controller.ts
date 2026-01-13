import { Request, Response } from 'express';
import { AuthRequest } from '@src/middlewares/auth';
import * as s from './service';
import * as repo from './repo';
import type { CreateCategoryFields, UpdateCategoryFields } from './model';

export async function create(req: AuthRequest, res: Response) {
  const body = req.body as { name?: unknown; description?: unknown };
  
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
}

export function getAll(req: Request, res: Response) {
  repo.all().then(categories => {
    res.json(categories);
  });
}

export function getById(req: Request, res: Response) {
  const id = req.params.id;
  repo.getById(id).then(category => {
    if (!category) {
      res.status(404).json({ error: 'not found' });
    } else {
      res.json(category);
    }
  });
}

export async function update(req: AuthRequest, res: Response) {
  const id = req.params.id;
  const body = req.body as { name?: unknown; description?: unknown };
  
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
}

export async function deleteById(req: AuthRequest, res: Response) {
  const id = req.params.id;
  await s.deleteCategory(id);
  res.status(204).send();
}

export async function assignToEvent(req: AuthRequest, res: Response) {
  const eventId = req.params.eventId;
  const body = req.body as { categoryId?: unknown };
  const categoryId = typeof body.categoryId === 'string' ? body.categoryId : null;
  if (!categoryId) {
    return res.status(400).json({ error: 'invalid' });
  }
  const assignment = await s.assignToEvent(eventId, categoryId);
  res.status(201).json(assignment);
}

export async function removeFromEvent(req: AuthRequest, res: Response) {
  const eventId = req.params.eventId;
  const categoryId = req.params.categoryId;
  await s.removeFromEvent(eventId, categoryId);
  res.status(204).send();
}

export function getByEvent(req: Request, res: Response) {
  const eventId = req.params.eventId;
  repo.getByEventId(eventId).then(assignments => {
    res.json(assignments);
  });
}

