import { Request, Response } from 'express';
import { AuthRequest } from '@src/middlewares/auth';
import * as s from './service';
import type { CreateContractFields, UpdateContractFields } from './model';

export async function create(req: AuthRequest, res: Response) {
  try {
    const body = req.body as {
      fightId?: unknown,
      fighterId?: unknown,
      contractAmount?: unknown,
      currency?: unknown,
      contractTerms?: unknown,
    };
    const fightId = typeof body.fightId === 'string' ? body.fightId : null;
    const fighterId = typeof body.fighterId === 'string' ? body.fighterId : null;
    const contractAmount = typeof body.contractAmount === 'number' ? body.contractAmount : null;
    const currency = typeof body.currency === 'string' ? body.currency : undefined;
    const contractTerms = typeof body.contractTerms === 'string' ? body.contractTerms : null;
    if (!fightId || !fighterId || contractAmount === null) {
      return res.status(400).json({ error: 'invalid' });
    }
    const fields: CreateContractFields = {
      fightId,
      fighterId,
      contractAmount,
      currency,
      contractTerms,
    };
    const contract = await s.create(fields);
    res.status(201).json(contract);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'invalid' });
  }
}

export async function getByFight(req: Request, res: Response) {
  const fightId = req.params.fightId;
  const contracts = await s.findByFight(fightId);
  res.json(contracts);
}

export async function getByFighter(req: Request, res: Response) {
  const fighterId = req.params.fighterId;
  const contracts = await s.findByFighter(fighterId);
  res.json(contracts);
}

export async function getById(req: Request, res: Response) {
  const id = req.params.id;
  const contract = await s.getById(id);
  if (!contract) {
    return res.status(404).json({ error: 'Fight contract not found' });
  }
  res.json(contract);
}

export async function update(req: AuthRequest, res: Response) {
  const id = req.params.id;
  const body = req.body as any;
  
  const contractAmount = typeof body.contractAmount === 'number' ? body.contractAmount : undefined;
  const currency = typeof body.currency === 'string' ? body.currency : undefined;
  const contractSigned = typeof body.contractSigned === 'boolean' ? body.contractSigned : undefined;
  const contractTerms = typeof body.contractTerms === 'string' ? body.contractTerms : null;
  
  const fields: UpdateContractFields = {
    contractAmount,
    currency,
    contractSigned,
    contractTerms,
  };
  
  const contract = await s.update(id, fields);
  if (!contract) {
    return res.status(404).json({ error: 'Fight contract not found' });
  }
  
  res.json(contract);
}

export async function deleteById(req: AuthRequest, res: Response) {
  const id = req.params.id;
  await s.deleteContract(id);
  res.status(204).send();
}
