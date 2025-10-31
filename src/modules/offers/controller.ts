import { Request, Response } from 'express';
import * as s from './service';

export async function getAll(_req: Request, res: Response) {
  const r = await s.list();
  res.json(r);
}


