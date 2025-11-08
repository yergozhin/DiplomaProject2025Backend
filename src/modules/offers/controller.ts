import { Response } from 'express';
import { AuthRequest } from '@src/middlewares/auth';
import * as s from './service';

interface SendOffersBody {
  fightId?: unknown;
  eventId?: unknown;
  eventSlotId?: unknown;
  fighterAAmount?: unknown;
  fighterACurrency?: unknown;
  fighterBAmount?: unknown;
  fighterBCurrency?: unknown;
}

interface DeleteOfferBody {
  fightId?: unknown;
}

interface UpdateOfferBody {
  offerId?: unknown;
  status?: unknown;
}

function parseId(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

function parseCurrency(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

function parseAmount(value: unknown): number | null {
  if (typeof value !== 'number') return null;
  if (!Number.isFinite(value)) return null;
  return value;
}

export async function getAll(_req: AuthRequest, res: Response) {
  const r = await s.list();
  res.json(r);
}

export async function sendOffers(req: AuthRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'unauthorized' });
  if (req.user.role === 'plo' && req.user.ploStatus !== 'verified') {
    return res.status(403).json({ error: 'plo_not_verified' });
  }
  const body = req.body as SendOffersBody;
  const fightId = parseId(body.fightId);
  const eventId = parseId(body.eventId);
  const eventSlotId = parseId(body.eventSlotId);
  const fighterAAmount = parseAmount(body.fighterAAmount);
  const fighterACurrency = parseCurrency(body.fighterACurrency);
  const fighterBAmount = parseAmount(body.fighterBAmount);
  const fighterBCurrency = parseCurrency(body.fighterBCurrency);
  if (!fightId || !eventId || !eventSlotId || fighterAAmount === null || !fighterACurrency || fighterBAmount === null || !fighterBCurrency) {
    return res.status(400).json({ error: 'invalid' });
  }
  const result = await s.sendOffers(req.user.userId, fightId, eventId, eventSlotId, fighterAAmount, fighterACurrency, fighterBAmount, fighterBCurrency);
  if ('error' in result) {
    if (result.error === 'fight_not_found') return res.status(404).json({ error: 'fight_not_found' });
    if (result.error === 'fight_not_accepted') return res.status(400).json({ error: 'fight_not_accepted' });
    if (result.error === 'event_not_found') return res.status(404).json({ error: 'event_not_found' });
    if (result.error === 'event_not_owned') return res.status(403).json({ error: 'forbidden' });
    if (result.error === 'slot_not_found') return res.status(404).json({ error: 'slot_not_found' });
    if (result.error === 'slot_not_in_event') return res.status(400).json({ error: 'slot_not_in_event' });
    if (result.error === 'slot_already_assigned') return res.status(409).json({ error: 'slot_already_assigned' });
    if (result.error === 'offer_already_exists') return res.status(409).json({ error: 'offer_already_exists' });
    return res.status(400).json({ error: result.error });
  }
  res.status(201).json(result);
}

export async function deleteOffer(req: AuthRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'unauthorized' });
  if (req.user.role === 'plo' && req.user.ploStatus !== 'verified') {
    return res.status(403).json({ error: 'plo_not_verified' });
  }
  const body = req.body as DeleteOfferBody;
  const fightId = parseId(body.fightId);
  if (!fightId) {
    return res.status(400).json({ error: 'invalid' });
  }
  const result = await s.deleteOffer(req.user.userId, fightId);
  if ('error' in result) {
    if (result.error === 'offer_not_found') return res.status(404).json({ error: 'offer_not_found' });
    return res.status(400).json({ error: result.error });
  }
  res.status(204).end();
}

export async function getAvailableOffers(req: AuthRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'unauthorized' });
  const r = await s.getAvailableByFighterId(req.user.userId);
  res.json(r);
}

export async function updateOfferStatus(req: AuthRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'unauthorized' });
  const body = req.body as UpdateOfferBody;
  const offerId = parseId(body.offerId);
  const status = parseCurrency(body.status);
  if (!offerId || !status) {
    return res.status(400).json({ error: 'invalid' });
  }
  if (status !== 'accepted' && status !== 'rejected') {
    return res.status(400).json({ error: 'invalid' });
  }
  const result = await s.updateOfferStatus(req.user.userId, offerId, status);
  if ('error' in result) {
    if (result.error === 'offer_not_found') return res.status(404).json({ error: 'offer_not_found' });
    if (result.error === 'forbidden') return res.status(403).json({ error: 'forbidden' });
    if (result.error === 'offer_already_responded') return res.status(400).json({ error: 'offer_already_responded' });
    return res.status(400).json({ error: result.error });
  }
  res.json(result.offer);
}

export async function getAvailableOffersForFight(req: AuthRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'unauthorized' });
  const { fightId } = req.params;
  if (!fightId) {
    return res.status(400).json({ error: 'invalid' });
  }
  const r = await s.getAvailableOffersForFightByFighter(fightId, req.user.userId);
  res.json(r);
}


