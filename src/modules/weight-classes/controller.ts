import { Request, Response } from 'express';
import { AuthRequest } from '@src/middlewares/auth';
import * as s from './service';
import type { CreateWeightClassFields, UpdateWeightClassFields } from './model';

export async function create(req: AuthRequest, res: Response) {
  try {
    const body = req.body as {
      name?: unknown,
      minWeightKg?: unknown,
      maxWeightKg?: unknown,
      description?: unknown,
    };
    const name = typeof body.name === 'string' ? body.name : null;
    const minWeightKg = typeof body.minWeightKg === 'number' ? body.minWeightKg : null;
    const maxWeightKg = typeof body.maxWeightKg === 'number' ? body.maxWeightKg : null;
    const description = typeof body.description === 'string' ? body.description : null;
    
    if (!name) {
      return res.status(400).json({ error: 'invalid' });
    }

    const fields: CreateWeightClassFields = {
      name,
      minWeightKg,
      maxWeightKg,
      description,
    };
    
    const weightClass = await s.create(fields);
    res.status(201).json(weightClass);
  } catch (err: unknown) {
    const message = err && typeof err === 'object' && 'message' in err && typeof err.message === 'string' ? err.message : 'invalid';
    res.status(400).json({ error: message });
  }
}

export function getAll(req: Request, res: Response) {
  s.getAll().then(weightClasses => {
    res.json(weightClasses);
  });
}

export function getById(req: Request, res: Response) {
  const id = req.params.id;
  s.getById(id).then(weightClass => {
    if (!weightClass) {
      res.status(404).json({ error: 'not found' });
    } else {
      res.json(weightClass);
    }
  });
}

export async function getByName(req: Request, res: Response) {
  const name = req.params.name;
  const weightClass = await s.getByName(name);
  if (!weightClass) {
    return res.status(404).json({ error: 'Weight class not found' });
  }
  res.json(weightClass);
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id;
    const body = req.body as {
      name?: unknown,
      minWeightKg?: unknown,
      maxWeightKg?: unknown,
      description?: unknown,
    };
    
    const fields: UpdateWeightClassFields = {};
    
    if (body.name !== undefined) {
      fields.name = typeof body.name === 'string' ? body.name : undefined;
    }
    if (body.minWeightKg !== undefined && typeof body.minWeightKg === 'number') {
      fields.minWeightKg = body.minWeightKg;
    }
    if (body.maxWeightKg !== undefined && typeof body.maxWeightKg === 'number') {
      fields.maxWeightKg = body.maxWeightKg;
    }
    if (body.description !== undefined) {
      fields.description = typeof body.description === 'string' ? body.description : null;
    }
    
    const weightClass = await s.update(id, fields);
    if (!weightClass) {
      return res.status(404).json({ error: 'Weight class not found' });
    }
    
    res.json(weightClass);
  } catch (err: unknown) {
    const message = err && typeof err === 'object' && 'message' in err && typeof err.message === 'string' ? err.message : 'invalid';
    res.status(400).json({ error: message });
  }
}

export async function deleteById(req: AuthRequest, res: Response) {
  const id = req.params.id;
  await s.remove(id);
  res.status(204).send();
}

