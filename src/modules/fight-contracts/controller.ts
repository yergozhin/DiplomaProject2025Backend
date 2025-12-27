import { Request, Response } from 'express';
import { AuthRequest } from '@src/middlewares/auth';
import * as s from './service';
import type { CreateContractFields, UpdateContractFields } from './model';

export async function create(req: AuthRequest, res: Response) {
  try {
    const body = req.body as {
      fightId?: unknown;
      fighterId?: unknown;
      contractAmount?: unknown;
      currency?: unknown;
      contractTerms?: unknown;
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
  } catch {
    res.status(500).json({ error: 'Failed to create fight contract' });
  }
}

export async function getByFight(req: Request, res: Response) {
  try {
    const fightId = req.params.fightId;
    const contracts = await s.getByFightId(fightId);
    res.json(contracts);
  } catch {
    res.status(500).json({ error: 'Failed to get fight contracts' });
  }
}

export async function getByFighter(req: Request, res: Response) {
  try {
    const fighterId = req.params.fighterId;
    const contracts = await s.getByFighterId(fighterId);
    res.json(contracts);
  } catch {
    res.status(500).json({ error: 'Failed to get fight contracts' });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const contract = await s.getById(id);
    if (!contract) {
      return res.status(404).json({ error: 'Fight contract not found' });
    }
    res.json(contract);
  } catch {
    res.status(500).json({ error: 'Failed to get fight contract' });
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id;
    const body = req.body as {
      contractAmount?: unknown;
      currency?: unknown;
      contractSigned?: unknown;
      contractTerms?: unknown;
    };
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
  } catch {
    res.status(500).json({ error: 'Failed to update fight contract' });
  }
}

export async function deleteById(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id;
    await s.deleteById(id);
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Failed to delete fight contract' });
  }
}
