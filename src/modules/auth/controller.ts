import { Request, Response } from 'express';
import * as service from './service';

export async function register(req: Request, res: Response) {
  const { email, password, role } = req.body;
  if (!email || !password || !role) return res.status(400).json({ error: 'invalid' });
  const u = await service.register(email, password, role);
  if (!u) return res.status(409).json({ error: 'exists' });
  res.status(201).json(u);
}

export async function login(req: Request, res: Response) {
  const { email, password, role } = req.body;
  if (!email || !password || !role) return res.status(400).json({ error: 'invalid' });
  const result = await service.login(email, password, role);
  if (!result) return res.status(401).json({ error: 'unauthorized' });
  res.json(result);
}


