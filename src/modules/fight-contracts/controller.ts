import { Request, Response } from 'express';
import { AuthRequest } from '@src/middlewares/auth';
import * as s from './service';
import type { CreateContractFields, UpdateContractFields } from './model';

export async function create(req: AuthRequest, res: Response) {
  try {
    const fields: CreateContractFields = {
      fightId: req.body.fightId,
      fighterId: req.body.fighterId,
      contractAmount: req.body.contractAmount,
      currency: req.body.currency,
      contractTerms: req.body.contractTerms,
    };
    const contract = await s.create(fields);
    res.status(201).json(contract);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create fight contract' });
  }
}

export async function getByFight(req: Request, res: Response) {
  try {
    const fightId = req.params.fightId;
    const contracts = await s.getByFightId(fightId);
    res.json(contracts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get fight contracts' });
  }
}

export async function getByFighter(req: Request, res: Response) {
  try {
    const fighterId = req.params.fighterId;
    const contracts = await s.getByFighterId(fighterId);
    res.json(contracts);
  } catch (err) {
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
  } catch (err) {
    res.status(500).json({ error: 'Failed to get fight contract' });
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id;
    const fields: UpdateContractFields = {
      contractAmount: req.body.contractAmount,
      currency: req.body.currency,
      contractSigned: req.body.contractSigned,
      contractTerms: req.body.contractTerms,
    };
    const contract = await s.update(id, fields);
    if (!contract) {
      return res.status(404).json({ error: 'Fight contract not found' });
    }
    res.json(contract);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update fight contract' });
  }
}

export async function deleteById(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id;
    await s.deleteById(id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete fight contract' });
  }
}

