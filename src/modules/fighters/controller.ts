import { Request, Response } from 'express';
import * as s from './service';

export async function getAll(_req: Request, res: Response) {
  const r = await s.list();
  res.json(r);
}

export async function create(req: Request, res: Response) {
  const { name, weightClass } = req.body;
  if (!name || !weightClass) return res.status(400).json({ error: 'invalid' });
  const r = await s.add(name, weightClass);
  res.status(201).json(r);
}

export async function update(req: Request, res: Response) {
  const { id } = req.params;
  const { name, weightClass } = req.body;
  if (!id || !name || !weightClass) return res.status(400).json({ error: 'invalid' });
  const r = await s.edit(id, name, weightClass);
  if (!r) return res.status(404).json({ error: 'not_found' });
  res.json(r);
}

export async function remove(req: Request, res: Response) {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'invalid' });
  await s.del(id);
  res.status(204).end();
}


