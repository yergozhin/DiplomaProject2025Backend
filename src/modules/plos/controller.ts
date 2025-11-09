import { Response } from 'express';
import { AuthRequest } from '@src/middlewares/auth';
import * as s from './service';

interface UpdateBody {
  leagueName?: unknown;
  ownerFirstName?: unknown;
  ownerLastName?: unknown;
  phoneNumber?: unknown;
  website?: unknown;
  country?: unknown;
  city?: unknown;
  address?: unknown;
  description?: unknown;
  logo?: unknown;
  foundedDate?: unknown;
  socialMediaLinks?: unknown;
}

function parseString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseDate(value: unknown): string | null {
  const str = parseString(value);
  if (!str) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return null;
  return str;
}

export async function getProfile(req: AuthRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'unauthorized' });
  const profile = await s.getProfile(req.user.userId);
  if (!profile) return res.status(404).json({ error: 'not_found' });
  res.json(profile);
}

export async function updateProfile(req: AuthRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'unauthorized' });
  const body = req.body as UpdateBody;

  const payload = {
    leagueName: parseString(body.leagueName),
    ownerFirstName: parseString(body.ownerFirstName),
    ownerLastName: parseString(body.ownerLastName),
    phoneNumber: parseString(body.phoneNumber),
    website: parseString(body.website),
    country: parseString(body.country),
    city: parseString(body.city),
    address: parseString(body.address),
    description: parseString(body.description),
    logo: parseString(body.logo),
    foundedDate: parseDate(body.foundedDate),
    socialMediaLinks: parseString(body.socialMediaLinks),
  };

  if (body.foundedDate && payload.foundedDate === null) {
    return res.status(400).json({ error: 'invalid_founded_date' });
  }

  const updated = await s.updateProfile(req.user.userId, payload);
  if (!updated) return res.status(404).json({ error: 'not_found' });
  res.json(updated);
}


