import { Request, Response } from 'express';
import { AuthRequest } from '@src/middlewares/auth';
import * as s from './service';
import type { CreateWeightClassFields, UpdateWeightClassFields } from './model';

export async function create(req: AuthRequest, res: Response) {
  try {
    const fields: CreateWeightClassFields = {
      name: req.body.name,
      minWeightKg: req.body.minWeightKg,
      maxWeightKg: req.body.maxWeightKg,
      description: req.body.description,
    };
    const weightClass = await s.create(fields);
    res.status(201).json(weightClass);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create weight class' });
  }
}

export async function getAll(req: Request, res: Response) {
  try {
    const weightClasses = await s.all();
    res.json(weightClasses);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get weight classes' });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const weightClass = await s.getById(id);
    if (!weightClass) {
      return res.status(404).json({ error: 'Weight class not found' });
    }
    res.json(weightClass);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get weight class' });
  }
}

export async function getByName(req: Request, res: Response) {
  try {
    const name = req.params.name;
    const weightClass = await s.getByName(name);
    if (!weightClass) {
      return res.status(404).json({ error: 'Weight class not found' });
    }
    res.json(weightClass);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get weight class' });
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id;
    const fields: UpdateWeightClassFields = {
      name: req.body.name,
      minWeightKg: req.body.minWeightKg,
      maxWeightKg: req.body.maxWeightKg,
      description: req.body.description,
    };
    const weightClass = await s.update(id, fields);
    if (!weightClass) {
      return res.status(404).json({ error: 'Weight class not found' });
    }
    res.json(weightClass);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update weight class' });
  }
}

export async function deleteById(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id;
    await s.deleteById(id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete weight class' });
  }
}

